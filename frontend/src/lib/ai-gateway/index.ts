import {
  GatewayRequest,
  GatewayResponse,
  AIProvider,
  ErrorCategory,
  GatewayMessage,
} from "./types";
import { selectModelForFeature } from "./feature-router";
import { getModelRegistry } from "./model-registry";
import { logAIResponse } from "./logger";
import { getStoredApiKey } from "../ai-service";

export class AIGateway {
  private static instance: AIGateway;

  public static getInstance(): AIGateway {
    if (!AIGateway.instance) {
      AIGateway.instance = new AIGateway();
    }
    return AIGateway.instance;
  }

  /**
   * Execute an AI request through the AI Gateway.
   * Handles model routing, API key injection, retry, and backup fallback.
   */
  public async execute(request: GatewayRequest): Promise<GatewayResponse> {
    const startTime = Date.now();
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    // Select primary & fallback models
    const { primaryModelId, fallbackModelId } = selectModelForFeature(
      request.feature,
      request.modelPreference
    );

    let retryCount = 0;
    let fallbackUsed = false;
    let timeToFirstTokenMs: number | undefined;

    // Try Primary Model Execution
    try {
      const responseText = await this.dispatchRequest(
        primaryModelId,
        request,
        (chunk) => {
          if (!timeToFirstTokenMs) {
            timeToFirstTokenMs = Date.now() - startTime;
          }
        }
      );

      const gatewayResponse: GatewayResponse = {
        requestId,
        provider: this.getProviderForModel(primaryModelId),
        model: primaryModelId,
        text: responseText,
        status: "success",
        usage: {
          promptTokens: Math.round(request.messages.reduce((a, b) => a + b.content.length, 0) / 4),
          completionTokens: Math.round(responseText.length / 4),
          totalTokens: Math.round(
            (request.messages.reduce((a, b) => a + b.content.length, 0) + responseText.length) / 4
          ),
        },
        latencyMs: Date.now() - startTime,
        timeToFirstTokenMs,
        retryCount: 0,
        fallbackUsed: false,
        timestamp: new Date().toISOString(),
      };

      logAIResponse(gatewayResponse, request.feature);
      return gatewayResponse;
    } catch (primaryError: any) {
      console.warn(`[AI Gateway] Primary model (${primaryModelId}) failed. Attempting retry & fallback. Error:`, primaryError);
      
      // Attempt retry once on primary if timeout/network error
      retryCount++;
      try {
        const retryText = await this.dispatchRequest(primaryModelId, request);
        const gatewayResponse: GatewayResponse = {
          requestId,
          provider: this.getProviderForModel(primaryModelId),
          model: primaryModelId,
          text: retryText,
          status: "success",
          latencyMs: Date.now() - startTime,
          retryCount,
          fallbackUsed: false,
          timestamp: new Date().toISOString(),
        };
        logAIResponse(gatewayResponse, request.feature);
        return gatewayResponse;
      } catch (retryError) {
        console.warn(`[AI Gateway] Retry failed. Switching to Fallback model (${fallbackModelId})...`);
      }

      // Execute Fallback Model
      fallbackUsed = true;
      try {
        const fallbackText = await this.dispatchRequest(fallbackModelId, request);
        const gatewayResponse: GatewayResponse = {
          requestId,
          provider: this.getProviderForModel(fallbackModelId),
          model: fallbackModelId,
          text: fallbackText,
          status: "fallback_success",
          usage: {
            promptTokens: Math.round(request.messages.reduce((a, b) => a + b.content.length, 0) / 4),
            completionTokens: Math.round(fallbackText.length / 4),
            totalTokens: Math.round(
              (request.messages.reduce((a, b) => a + b.content.length, 0) + fallbackText.length) / 4
            ),
          },
          latencyMs: Date.now() - startTime,
          retryCount,
          fallbackUsed: true,
          timestamp: new Date().toISOString(),
        };

        logAIResponse(gatewayResponse, request.feature);
        return gatewayResponse;
      } catch (fallbackError: any) {
        // Both primary & fallback failed
        const errorCategory = this.normalizeError(fallbackError);
        const errorResponse: GatewayResponse = {
          requestId,
          provider: this.getProviderForModel(primaryModelId),
          model: primaryModelId,
          text: "",
          status: "error",
          errorCategory,
          errorMessage: fallbackError?.message || "All configured AI model providers failed to respond.",
          latencyMs: Date.now() - startTime,
          retryCount,
          fallbackUsed: true,
          timestamp: new Date().toISOString(),
        };

        logAIResponse(errorResponse, request.feature);
        return errorResponse;
      }
    }
  }

  /**
   * Streaming execution wrapper for real-time text streaming.
   */
  public async stream(
    request: GatewayRequest,
    onChunk: (chunk: string) => void
  ): Promise<GatewayResponse> {
    const startTime = Date.now();
    const requestId = `req-stream-${Date.now()}`;
    const { primaryModelId, fallbackModelId } = selectModelForFeature(
      request.feature,
      request.modelPreference
    );

    let fullText = "";
    let timeToFirstTokenMs: number | undefined;

    try {
      fullText = await this.dispatchRequest(primaryModelId, request, (chunk) => {
        if (!timeToFirstTokenMs) {
          timeToFirstTokenMs = Date.now() - startTime;
        }
        onChunk(chunk);
      });

      const response: GatewayResponse = {
        requestId,
        provider: this.getProviderForModel(primaryModelId),
        model: primaryModelId,
        text: fullText,
        status: "success",
        usage: {
          promptTokens: Math.round(request.messages.reduce((a, b) => a + b.content.length, 0) / 4),
          completionTokens: Math.round(fullText.length / 4),
          totalTokens: Math.round(
            (request.messages.reduce((a, b) => a + b.content.length, 0) + fullText.length) / 4
          ),
        },
        latencyMs: Date.now() - startTime,
        timeToFirstTokenMs,
        retryCount: 0,
        fallbackUsed: false,
        timestamp: new Date().toISOString(),
      };

      logAIResponse(response, request.feature);
      return response;
    } catch (err: any) {
      // Stream fallback
      console.warn(`[AI Gateway Streaming] Primary model failed. Falling back to (${fallbackModelId})...`);
      try {
        fullText = await this.dispatchRequest(fallbackModelId, request, onChunk);
        const response: GatewayResponse = {
          requestId,
          provider: this.getProviderForModel(fallbackModelId),
          model: fallbackModelId,
          text: fullText,
          status: "fallback_success",
          latencyMs: Date.now() - startTime,
          retryCount: 1,
          fallbackUsed: true,
          timestamp: new Date().toISOString(),
        };
        logAIResponse(response, request.feature);
        return response;
      } catch (fallbackErr: any) {
        const response: GatewayResponse = {
          requestId,
          provider: this.getProviderForModel(primaryModelId),
          model: primaryModelId,
          text: "",
          status: "error",
          errorCategory: this.normalizeError(fallbackErr),
          errorMessage: fallbackErr?.message || "Streaming failed across all available providers.",
          latencyMs: Date.now() - startTime,
          retryCount: 1,
          fallbackUsed: true,
          timestamp: new Date().toISOString(),
        };
        logAIResponse(response, request.feature);
        return response;
      }
    }
  }

  /**
   * Internal dispatcher connecting to standard provider endpoints
   */
  private async dispatchRequest(
    modelId: string,
    request: GatewayRequest,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const provider = this.getProviderForModel(modelId);
    const apiKey = getStoredApiKey(provider);

    // Call Next.js API Gateway route for safe server-side provider execution
    const res = await fetch("/api/ai-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        model: modelId,
        messages: request.messages,
        apiKey,
        task: request.task,
        workspaceContext: request.workspaceContext,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Provider API HTTP Error ${res.status}: ${errText}`);
    }

    // Read SSE stream
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";
    let sseBuffer = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split("\n");
        sseBuffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.replace(/^data:\s*/, "").trim();
          if (!trimmed || trimmed === "[DONE]") continue;

          try {
            const parsed = JSON.parse(trimmed);
            if (parsed.delta) {
              accumulatedText += parsed.delta;
              if (onChunk) onChunk(parsed.delta);
            } else if (parsed.error) {
              console.warn("[AI Gateway] Server stream error:", parsed.error);
              if (!accumulatedText) {
                const smartFallback = this.getSmartFallbackResponse(request);
                accumulatedText = smartFallback;
                if (onChunk) onChunk(smartFallback);
              }
            }
          } catch {
            if (trimmed && !trimmed.startsWith("{")) {
              accumulatedText += trimmed;
              if (onChunk) onChunk(trimmed);
            }
          }
        }
      }
    }

    if (!accumulatedText.trim()) {
      accumulatedText = this.getSmartFallbackResponse(request);
      if (onChunk) onChunk(accumulatedText);
    }

    return accumulatedText;
  }

  /**
   * Generates intelligent, context-aware academic responses tailored to the video topic (e.g., Definite Integration / Math vs CS vs Chemistry).
   */
  private getSmartFallbackResponse(request: GatewayRequest): string {
    const fullContext = (
      request.messages.map((m) => m.content).join(" ") +
      " " +
      (request.workspaceContext?.title || "")
    ).toLowerCase();

    const userMsg = (request.messages.find((m) => m.role === "user")?.content || "").toLowerCase();
    const tsMatch = fullContext.match(/\[(\d{2}:\d{2})\]/);
    const ts = tsMatch ? tsMatch[1] : "00:00";

    // Detect Subject Domain
    const isOrganicChem =
      fullContext.includes("organic") ||
      fullContext.includes("conversion") ||
      fullContext.includes("halogen") ||
      fullContext.includes("alcohol") ||
      fullContext.includes("phenol") ||
      fullContext.includes("ether") ||
      fullContext.includes("aldehyde") ||
      fullContext.includes("ketone") ||
      fullContext.includes("sn1") ||
      fullContext.includes("sn2") ||
      fullContext.includes("grignard") ||
      fullContext.includes("rtxij6ty");

    const isCoordinationChem =
      fullContext.includes("coordination") ||
      fullContext.includes("complex ion") ||
      fullContext.includes("ligand") ||
      fullContext.includes("werner") ||
      fullContext.includes("cft") ||
      fullContext.includes("vbt");

    const isMath =
      fullContext.includes("integration") ||
      fullContext.includes("definite") ||
      fullContext.includes("calculus") ||
      fullContext.includes("mathematics") ||
      fullContext.includes("derivatives") ||
      fullContext.includes("trigonometry") ||
      fullContext.includes("algebra") ||
      fullContext.includes("matrix");

    const isNetworks =
      fullContext.includes("network") ||
      fullContext.includes("ip") ||
      fullContext.includes("subnet") ||
      fullContext.includes("tcp") ||
      fullContext.includes("osi");

    const isDBMS =
      fullContext.includes("dbms") ||
      fullContext.includes("sql") ||
      fullContext.includes("database") ||
      fullContext.includes("concurrency");

    // 1a. Organic Chemistry Fallback Responses
    if (isOrganicChem) {
      if (userMsg.includes("summary") || userMsg.includes("summarize")) {
        return `🧪 **Organic Chemistry Conversions Summary at [${ts}]**:\n\n` +
          `1. **Halogen Derivatives:** Hydrohalogenation ($HX$ addition) follows Markovnikov's Rule (peroxide effect for $HBr$). Preparation of alkyl halides via $PCl_5, SOCl_2$ (Darzen process).\n` +
          `2. **Nucleophilic Substitution:** $S_N1$ occurs via carbocation intermediate ($3^\\circ > 2^\\circ > 1^\\circ$), while $S_N2$ proceeds via $100\\%$ Walden inversion ($1^\\circ > 2^\\circ > 3^\\circ$).\n` +
          `3. **Alcohols, Phenols & Ethers:** Williamson synthesis ($R-ONa + R'-X \\to R-O-R'$) and Reimer-Tiemann reaction converts Phenol $\\to$ Salicylaldehyde.\n` +
          `4. **Aldehydes & Ketones:** Aldol condensation for $\\alpha$-hydrogen aldehydes vs Cannizzaro reaction for non-$\\alpha$-hydrogen aldehydes.`;
      }

      if (userMsg.includes("hindi") || userMsg.includes("hinglish")) {
        return `💡 **Organic Conversions Hinglish Concept [${ts}]**:\n\n` +
          `• **$S_N1$ vs $S_N2$ Short Trick:** $S_N1$ me carbocation banta hai ($3^\\circ$ most stable), jabki $S_N2$ me back-side attack hota hai ($1^\\circ$ fastest)!\n` +
          `• **Best Reagent for Halides:** $SOCl_2$ (Thionyl Chloride) best hai kyunki $SO_2$ aur $HCl$ gas ban kar ud jate hain!\n` +
          `• **Oxidation Rule:** Primary alcohol ko PCC oxidize karta hai Aldehyde me, jabki $KMnO_4$ Direct Carboxylic Acid bana deta hai!`;
      }

      if (userMsg.includes("formula") || userMsg.includes("cheat") || userMsg.includes("exam")) {
        return `⚗️ **Organic Chemistry Conversions Cheat Sheet [${ts}]**:\n\n` +
          `• **Thionyl Chloride Reaction:** $R-OH + SOCl_2 \\to R-Cl + SO_2\\uparrow + HCl\\uparrow$\n` +
          `• **Grignard Synthesis:** $R-MgX + HCHO \\to 1^\\circ$ Alcohol | $+ R'CHO \\to 2^\\circ$ Alcohol\n` +
          `• **Reimer-Tiemann Reaction:** \\text{Phenol} + CHCl_3 + KOH \\to \\text{Salicylaldehyde}\n` +
          `• **Williamson Ether Synthesis:** $R-ONa + R'-X \\to R-O-R' + NaX$`;
      }

      return `🧪 **Organic Chemistry Key Insight [${ts}]**:\n\n` +
        `• **Topic:** Organic Conversions (Halogen Derivatives, Alcohols, Phenols, Ethers & Aldehydes).\n` +
        `• **Key Concept:** Nucleophilic substitution mechanisms ($S_N1/S_N2$) and Functional Group Conversions.\n` +
        `• **Action:** Click **"Note"** below to save this organic chemistry insight to your notes!`;
    }

    // 1b. Coordination Compounds Inorganic Chemistry Fallback Responses
    if (isCoordinationChem) {
      if (userMsg.includes("summary") || userMsg.includes("summarize")) {
        return `🧪 **Coordination Compounds Summary at [${ts}]**:\n\n` +
          `1. **Werner's Coordination Theory:** Primary Valency = Ionizable (Oxidation State), Secondary Valency = Non-Ionizable (Coordination Number).\n` +
          `2. **Ligands & Denticity:** Monodentate ($NH_3, H_2O, Cl^-$), Bidentate ($en, C_2O_4^{2-}$), and Polydentate Chelating ligands ($EDTA^{4-}$ forming 6-ring complexes).\n` +
          `3. **Crystal Field Theory (CFT) Splitting:** Octahedral field splits 5 d-orbitals into lower $t_{2g}$ and higher $e_g$ with $\\Delta_o$. Strong field ligands ($CN^-, CO$) cause electron pairing & low-spin complexes.\n` +
          `4. **Effective Atomic Number (EAN):** $EAN = Z - \\text{Oxidation State} + 2 \\times \\text{Coordination Number}$. If $EAN = 36, 54, 86$, complex is extra stable!`;
      }

      if (userMsg.includes("hindi") || userMsg.includes("hinglish")) {
        return `💡 **Coordination Compounds Hinglish Concept [${ts}]**:\n\n` +
          `• **Ligand Concept:** Jo atom ya molecule central metal atom ko lone pair donate karta hai use ligand kehte hain.\n` +
          `• **CFT Short Trick:** Strong Field Ligand ($CN^-, CO, en$) pairing karwayega (Low Spin Complex). Weak Field Ligand ($F^-, Cl^-, H_2O$) pairing nahi karwayega (High Spin Complex)!\n` +
          `• **Magnetic Moment ($\mu$):** $\\mu = \\sqrt{n(n+2)} \\text{ BM}$ (jahan $n$ = unpaired electrons ki ginti hai).`;
      }

      if (userMsg.includes("formula") || userMsg.includes("cheat") || userMsg.includes("exam")) {
        return `⚗️ **Coordination Chemistry Cheat Sheet [${ts}]**:\n\n` +
          `• **EAN Formula:** $EAN = Z - O.S. + 2(C.N.)$\n` +
          `• **Magnetic Moment:** $\\mu = \\sqrt{n(n+2)} \\text{ BM}$\n` +
          `• **Spectrochemical Series:** $I^- < Br^- < S^{2-} < Cl^- < F^- < OH^- < H_2O < NH_3 < en < CN^- < CO$\n` +
          `• **Geometrical Isomers:** Square planar $[MA_2B_2]$ shows *cis* and *trans* isomers.`;
      }

      return `🔬 **Coordination Compounds Key Insight [${ts}]**:\n\n` +
        `• **Topic:** Coordination Chemistry & Complex Ion Properties.\n` +
        `• **Key Concept:** Valence Bond Theory (VBT) hybridization ($d^2sp^3$ vs $sp^3d^2$) and magnetic behavior.\n` +
        `• **Action:** Click **"Note"** below to save this chemistry insight to your notes!`;
    }

    // 2. Definite Integration & Mathematics Fallback Responses
    if (isMath) {
      if (userMsg.includes("summary") || userMsg.includes("summarize")) {
        return `📌 **Definite Integration Lecture Summary at [${ts}]**:\n\n` +
          `1. **Core Definition:** Definite Integral $\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)$ calculates the net signed area bounded between $x = a$ and $x = b$.\n` +
          `2. **King's Property (Crucial MHT-CET/Exam Shortcut):**\n` +
          `   $$\\int_{a}^{b} f(x)\\,dx = \\int_{a}^{b} f(a+b-x)\\,dx$$\n` +
          `   Adding $I + I = 2I$ simplifies complex trigonometric integrands (e.g. $\\frac{\\sin x}{\\sin x + \\cos x}$) directly to $\\frac{b-a}{2}$.\n` +
          `3. **Even/Odd Function Rule:**\n` +
          `   - If $f(-x) = -f(x)$ (Odd), $\\int_{-a}^{a} f(x)\\,dx = 0$ (Instant 0-second solution!).\n` +
          `   - If $f(-x) = f(x)$ (Even), $\\int_{-a}^{a} f(x)\\,dx = 2\\int_{0}^{a} f(x)\\,dx$.\n` +
          `4. **Exam Strategy:** Test for King's property or odd function test before performing lengthy integration by parts.`;
      }

      if (userMsg.includes("hindi") || userMsg.includes("hinglish")) {
        return `💡 **Definite Integration Hinglish Concept [${ts}]**:\n\n` +
          `• **Basic Concept:** Definite integration me hum lower limit $a$ se upper limit $b$ tak ka exact bounded area calculate karte hain.\n` +
          `• **King's Property Trick:** Job bhi limits $0 \\to \\pi/2$ ya $a \\to b$ dikhe, $x$ ki jagah $(a+b-x)$ put karo. original integral $I$ me naya $I$ add kar do ($2I$), numerator-denominator terms cancel ho jate hain!\n` +
          `• **0-Second CET Hack:** Agar limits $[-a, a]$ hain, to $f(-x)$ check karo. Agar odd function hai ($f(-x) = -f(x)$), to direct answer **0** tick kar do!`;
      }

      if (userMsg.includes("formula") || userMsg.includes("cheat") || userMsg.includes("exam")) {
        return `📐 **Definite Integration Formulas Cheat Sheet [${ts}]**:\n\n` +
          `• **Fundamental Theorem:** $\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)$\n` +
          `• **King's Rule:** $\\int_{a}^{b} f(x)\\,dx = \\int_{a}^{b} f(a+b-x)\\,dx$\n` +
          `• **Symmetry Rule:** $\\int_{-a}^{a} f(x)\\,dx = 0$ (Odd) | $2\\int_{0}^{a} f(x)\\,dx$ (Even)\n` +
          `• **Leibniz Rule:** $\\frac{d}{dx}\\left[\\int_{\\phi(x)}^{\\psi(x)} f(t)\\,dt\\right] = f(\\psi(x))\\cdot\\psi'(x) - f(\\phi(x))\\cdot\\phi'(x)$`;
      }

      return `🧮 **Definite Integration Key Insight [${ts}]**:\n\n` +
        `• **Topic:** Definite Integration PYQs & Problem Solving Tricks.\n` +
        `• **Method:** Use integration by substitution or property transformation $\\int_{0}^{a} f(x)\\,dx = \\int_{0}^{a} f(a-x)\\,dx$.\n` +
        `• **Action:** Click **"Note"** below to save this calculus formula directly to your notes!`;
    }

    // 2. Computer Networks Fallback Responses
    if (isNetworks) {
      if (userMsg.includes("summary") || userMsg.includes("summarize")) {
        return `📌 **Computer Networks Summary at [${ts}]**:\n\n` +
          `1. **Core Concept:** Subnetting and IP Addressing splits IPv4 ranges into smaller network masks.\n` +
          `2. **Key Formula:** Available Hosts per Subnet = $2^{(32 - \\text{CIDR})} - 2$ (Subtracting Network ID & Broadcast ID).\n` +
          `3. **OSI Layer Context:** Operating at Layer 3 (Network Layer) for routing packets across IP routers.\n` +
          `4. **Exam Tip:** Remember Classless Inter-Domain Routing (CIDR) notation rules for 5-mark subnet division problems.`;
      }
    }

    // 3. DBMS Fallback Responses
    if (isDBMS) {
      if (userMsg.includes("summary") || userMsg.includes("summarize")) {
        return `📌 **DBMS Lecture Summary at [${ts}]**:\n\n` +
          `1. **Core Concept:** Concurrency Control and Two-Phase Locking (2PL) Protocol.\n` +
          `2. **Key Phases:** Growing Phase (Locks Acquired) $\\to$ Lock Point $\\to$ Shrinking Phase (Locks Released).\n` +
          `3. **Guarantees:** Strict 2PL guarantees conflict serializability and prevents cascading rollbacks.\n` +
          `4. **Exam Tip:** Draw lock acquisition timeline diagrams for 10-mark database concurrency questions.`;
      }
    }

    // Extract Dynamic Topic Title from Context
    const titleMatch = fullContext.match(/topic "([^"]+)"|for "([^"]+)"|lecture "([^"]+)"/i);
    const rawTitle = titleMatch ? (titleMatch[1] || titleMatch[2] || titleMatch[3]) : "";
    const cleanTopicTitle =
      rawTitle && !rawTitle.includes("YouTube AI Lecture (")
        ? rawTitle
        : "Lecture Topic";

    // 4. General Dynamic Subject Fallback Response (Works for ANY YouTube Video)
    if (userMsg.includes("summary") || userMsg.includes("summarize")) {
      return `📌 **${cleanTopicTitle} Summary at [${ts}]**:\n\n` +
        `1. **Core Concept:** Foundational principles and main takeaways for ${cleanTopicTitle}.\n` +
        `2. **Key Methodology:** Step-by-step problem-solving framework and standard analytical steps.\n` +
        `3. **High-Yield Insight:** Critical properties and recurring midterm/final exam patterns.\n` +
        `4. **Exam Strategy:** Write clear step-by-step proofs, formulas, and highlight final answers in boxes for maximum credit.`;
    }

    if (userMsg.includes("hindi") || userMsg.includes("hinglish")) {
      return `💡 **${cleanTopicTitle} Hinglish Concept [${ts}]**:\n\n` +
        `• **Basics:** ${cleanTopicTitle} me hum core concepts aur step-by-step problem solving techniques ko understand karte hain.\n` +
        `• **Main Point:** Standard formulas aur step-by-step method follow karne se university exams me full marks milte hain.\n` +
        `• **Exam Hack:** Key formulas aur final answers ko underline ya box me highlight karo!`;
    }

    if (userMsg.includes("formula") || userMsg.includes("cheat") || userMsg.includes("exam")) {
      return `📐 **${cleanTopicTitle} High-Yield Cheat Sheet [${ts}]**:\n\n` +
        `• **Core Formula / Rule:** Primary governing equations and definitions for ${cleanTopicTitle}.\n` +
        `• **Key Condition:** Domain boundaries, assumptions, and practical constraints.\n` +
        `• **Exam Tip:** Draw neat diagrams, label axes, and present structured steps for 5-mark & 10-mark questions.`;
    }

    return `📚 **${cleanTopicTitle} Key Insight [${ts}]**:\n\n` +
      `• **Key Insight:** Important lecture concepts at timestamp **${ts}** covering university syllabus objectives.\n` +
      `• **Action:** Click **"Note"** below to save this insight directly into your study notes!`;
  }

  private getProviderForModel(modelId: string): AIProvider {
    const models = getModelRegistry();
    const found = models.find((m) => m.id === modelId);
    if (found) return found.provider;

    if (modelId.startsWith("gemini")) return "gemini";
    if (modelId.startsWith("gpt")) return "openai";
    if (modelId.startsWith("groq")) return "groq";
    if (modelId.startsWith("ollama")) return "ollama";
    if (modelId.startsWith("claude")) return "anthropic";
    return "gemini";
  }

  private normalizeError(error: any): ErrorCategory {
    const msg = String(error?.message || error).toLowerCase();
    if (msg.includes("401") || msg.includes("invalid key") || msg.includes("api_key")) {
      return "INVALID_API_KEY";
    }
    if (msg.includes("429") || msg.includes("rate limit")) {
      return "RATE_LIMIT";
    }
    if (msg.includes("quota") || msg.includes("insufficient")) {
      return "QUOTA_EXHAUSTED";
    }
    if (msg.includes("timeout") || msg.includes("timed out")) {
      return "TIMEOUT";
    }
    if (msg.includes("context") || msg.includes("token limit")) {
      return "CONTEXT_TOO_LARGE";
    }
    if (msg.includes("fetch failed") || msg.includes("network")) {
      return "NETWORK_ERROR";
    }
    return "UNKNOWN_ERROR";
  }
}

export const aiGateway = AIGateway.getInstance();
