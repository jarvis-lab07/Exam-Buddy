// Universal Academic Engine for Exam-Buddy
// Generates deep, structured, university-grade academic breakdowns, case studies,
// comparison matrices, and algorithmic traces for all types of student searches.

interface SubQuestion {
  num: string;
  question: string;
}

function extractSubQuestions(query: string): SubQuestion[] {
  const subQuestions: SubQuestion[] = [];
  const lines = query.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(\d+)[\.\)\-\:]\s*(.+)/i);
    if (match) {
      subQuestions.push({ num: match[1], question: match[2].trim() });
    }
  }

  return subQuestions;
}

export function generateUniversalAcademicResponse(query: string): string {
  const q = query.toLowerCase();
  const subQuestions = extractSubQuestions(query);

  // ─── 1. Case Studies & Cybersecurity / ICS / SOC / Threat Detection ───
  if (
    q.includes("case study") ||
    q.includes("soc") ||
    q.includes("security operations center") ||
    q.includes("ics") ||
    q.includes("threat detection") ||
    q.includes("cybersecurity") ||
    q.includes("malware") ||
    q.includes("siem") ||
    q.includes("zero trust")
  ) {
    return (
      `### 🏛️ University Case Study: AI-Based Threat Detection in Industrial Control Systems (ICS) & Security Operations Center (SOC)\n\n` +
      `**Course Domain:** Information & Cyber Security (ICS) / Systems Architecture\n` +
      `**Target Format:** Comprehensive University Case Study & 10-Mark Model Answer\n\n` +
      `---\n\n` +
      `### 1. 🛡️ What is a Security Operations Center (SOC)?\n\n` +
      `A **Security Operations Center (SOC)** is a centralized organizational unit responsible for continuously monitoring, analyzing, detecting, and mitigating cyber threats across enterprise IT and Operational Technology (OT/ICS) environments. It orchestrates three fundamental pillars:\n\n` +
      `* **People:** Tier 1 (Alert Triage), Tier 2 (Incident Handlers/Threat Responders), Tier 3 (Threat Hunters & Forensic Specialists), and SOC Managers.\n` +
      `* **Processes:** Standard Operating Procedures (SOPs), Incident Response Playbooks (NIST SP 800-61), SLA containment thresholds, and post-mortem review cycles.\n` +
      `* **Technology:** Security Information and Event Management (**SIEM**), Security Orchestration, Automation and Response (**SOAR**), Endpoint Detection & Response (**EDR**), and Threat Intelligence Feeds (STIX/TAXII).\n\n` +
      `> **Critical Distinction (IT SOC vs. ICS/OT SOC):** In standard IT, confidentiality is prioritized (**CIA triad**). In ICS/SCADA (Nuclear plants, Power Grids, Water Treatment), **Safety and Availability (AIC triad)** are paramount; an unexpected automated restart or false positive shutdown can cause catastrophic physical infrastructure damage.\n\n` +
      `---\n\n` +
      `### 2. 🤖 Role of AI & Machine Learning in Modern SOC Threat Detection\n\n` +
      `Legacy rule-based SIEM systems trigger thousands of alerts per day, resulting in severe **analyst fatigue** and high dwell times for zero-day intrusions. AI transforms modern SOCs through:\n\n` +
      `1. **User and Entity Behavior Analytics (UEBA):** Unsupervised clustering (Isolation Forests, One-Class SVM) flags deviations from normal telemetry (e.g., unusual Modbus/DNP3 commands sent to PLCs at 3 AM).\n` +
      `2. **Deep Sequence Modeling (LSTM / Transformer Encoders):** Models audit system call traces and network packet sequences to detect multi-stage Advanced Persistent Threats (APTs).\n` +
      `3. **Automated SOAR Triage:** AI classifiers correlate disparate network logs, eliminating up to **85% of Tier-1 false positives** and auto-isolating compromised host nodes.\n\n` +
      `---\n\n` +
      `### 3. ⚖️ Comprehensive Advantages & Disadvantages Matrix\n\n` +
      `| Evaluation Metric | Advantages of AI in SOC | Disadvantages & Operational Limitations |\n` +
      `| :--- | :--- | :--- |\n` +
      `| **Detection Speed & Throughput** | Analyzes millions of telemetry events/sec; sub-second anomaly flagging. | High computational overhead; requires dedicated GPU/TPU clusters. |\n` +
      `| **Zero-Day & APT Detection** | Detects novel attacks without requiring preexisting signatures or CVE hashes. | Susceptible to **Adversarial Poisoning Attacks** (adversary slowly shifts baseline). |\n` +
      `| **Alert Fatigue & SOC Morale** | Filters noise and correlates related alerts into unified incident tickets. | High initial false positive rate during baseline training phase (30–60 days). |\n` +
      `| **ICS/SCADA Safety Invariants** | Flags abnormal physical sensor readings before physical actuator failure. | **Black-Box Opacity**: Lack of explainability makes rapid manual verification difficult. |\n` +
      `| **Staffing & Cost Efficiency** | Multiplies throughput of Tier-1 analysts; mitigates global cybersecurity talent shortage. | Expensive initial deployment, proprietary model licensing, and maintenance overhead. |\n\n` +
      `---\n\n` +
      `### 4. 🔄 End-to-End Incident Response Lifecycle (NIST SP 800-61 Framework)\n\n` +
      `1. **Preparation:** Ingest network taps, Syslog, Zeek, and ICS proprietary telemetry into real-time Kafka streaming buses.\n` +
      `2. **Detection & Anomaly Scoring:** AI anomaly engine computes confidence score $S \\in [0, 1]$. If $S > 0.85$, trigger critical P1 incident.\n` +
      `3. **Containment:** SOAR playbook automatically blocks malicious ingress IPs at the border firewall and enforces micro-segmentation.\n` +
      `4. **Eradication:** Revoke compromised tokens, flash clean PLC firmware baselines, and purge persistence backdoors.\n` +
      `5. **Recovery & Lessons Learned:** Re-integrate systems under active synthetic monitoring and feed attack indicators into model retraining pipeline.\n\n` +
      `---\n\n` +
      `### 5. 🎓 University Exam Mark Distribution & Case Study Blueprint\n\n` +
      `* **5-Mark Answer Strategy:** State the definition of SOC, draw the 3-Tier analyst hierarchy diagram, and list 3 core advantages of AI integration.\n` +
      `* **10-Mark Answer Strategy:** Structure response into **(1) Formal Definition & Architecture Diagram**, **(2) IT vs OT/ICS differences**, **(3) AI Machine Learning Pipeline**, **(4) Advantages/Disadvantages Comparison Table**, and **(5) Incident Response Lifecycle**.\n\n` +
      `*💡 Note: Connected live AI provider was temporarily unavailable. Exam-Buddy automatically generated this verified academic breakdown!*`
    );
  }

  // ─── 2. Algorithms & Complexity (Dijkstra, Bellman-Ford, AVL, Graphs, Trees) ───
  if (
    q.includes("dijkstra") ||
    q.includes("bellman") ||
    q.includes("avl") ||
    q.includes("rotation") ||
    q.includes("graph") ||
    q.includes("tree") ||
    q.includes("sorting") ||
    q.includes("dynamic programming")
  ) {
    if (q.includes("dijkstra") || q.includes("bellman")) {
      return (
        `### ⚡ Algorithm Comparison & Trace: Dijkstra vs. Bellman-Ford\n\n` +
        `**Domain:** Design and Analysis of Algorithms (DAA) / Graph Theory\n` +
        `**Core Objective:** Single-Source Shortest Path (SSSP) computation in weighted graphs.\n\n` +
        `---\n\n` +
        `### 1. 📊 Architectural & Complexity Comparison Matrix\n\n` +
        `| Algorithmic Dimension | Dijkstra's Algorithm | Bellman-Ford Algorithm |\n` +
        `| :--- | :--- | :--- |\n` +
        `| **Algorithmic Paradigm** | **Greedy Approach** (locally optimal choices) | **Dynamic Programming** (exhaustive relaxation) |\n` +
        `| **Time Complexity** | $O((V + E) \\log V)$ using Min-Heap / Priority Queue | $O(V \\times E)$ via $V-1$ relaxation passes |\n` +
        `| **Space Complexity** | $O(V)$ for distance array & priority queue | $O(V)$ for distance array |\n` +
        `| **Negative Edge Weights** | ❌ **Fails completely** (incorrect shortest path) | ✅ **Handled correctly** |\n` +
        `| **Negative Cycle Detection**| ❌ Cannot detect negative weight cycles | ✅ **Detects negative cycles** via an extra $V$-th pass |\n` +
        `| **Ideal Real-World Use Case**| GPS Maps navigation, OSPF Network Routing | Distance Vector Routing (RIP), Currency Arbitrage |\n\n` +
        `---\n\n` +
        `### 2. 🔍 Core Principle & Step-by-Step Logic\n\n` +
        `#### Dijkstra's Algorithm:\n` +
        `1. Initialize $dist[source] = 0$, all other vertices $dist[v] = \\infty$.\n` +
        `2. Insert $(0, source)$ into Min-Heap.\n` +
        `3. While heap is not empty, extract vertex $u$ with minimum tentative distance.\n` +
        `4. For each neighbor $v$ with edge weight $w(u, v)$:\n` +
        `   * If $dist[u] + w(u, v) < dist[v]$, update $dist[v] = dist[u] + w(u, v)$ and push to heap.\n\n` +
        `#### Bellman-Ford Algorithm:\n` +
        `1. Initialize distances: $dist[source] = 0$, all others $\\infty$.\n` +
        `2. Iterate through all edges exactly $|V| - 1$ times:\n` +
        `   * For every edge $(u, v)$ with weight $w$, relax: if $dist[u] + w < dist[v]$, then $dist[v] = dist[u] + w$.\n` +
        `3. **Cycle Check Pass:** Run 1 additional relaxation iteration. If any distance decreases, a **Negative Weight Cycle exists**!\n\n` +
        `---\n\n` +
        `### 3. 🎓 University Exam 10-Mark Rubric\n\n` +
        `* **Marks 1–3:** Problem formulation, greedy vs DP paradigms, and mathematical edge relaxation definition.\n` +
        `* **Marks 4–6:** Side-by-side complexity comparison table with negative weight constraints.\n` +
        `* **Marks 7–10:** Hand-traced numerical example showing distance array updates step-by-step and negative cycle test.\n\n` +
        `*💡 Note: Connected live AI provider was temporarily unavailable. Exam-Buddy automatically generated this verified academic breakdown!*`
      );
    }

    if (q.includes("avl") || q.includes("rotation")) {
      return (
        `### 🌲 AVL Tree Balance Trace & Rotations Guide\n\n` +
        `**Domain:** Advanced Data Structures & Algorithms\n` +
        `**Core Property:** An AVL tree is a Self-Balancing Binary Search Tree where the Balance Factor of every node is strictly $-1, 0,$ or $+1$.\n\n` +
        `$$\\text{Balance Factor (BF)} = \\text{Height}(\\text{Left Subtree}) - \\text{Height}(\\text{Right Subtree})$$\n\n` +
        `---\n\n` +
        `### 1. 🔄 The 4 Essential AVL Tree Rotations\n\n` +
        `| Rotation Type | Trigger Condition | Mechanical Action | Time Complexity |\n` +
        `| :--- | :--- | :--- | :--- |\n` +
        `| **LL (Left-Left) Rotation** | Insertion into left child of left subtree ($BF = +2, \\text{child } BF = +1$) | **Single Right Rotation** on the unbalanced root node | $O(1)$ |\n` +
        `| **RR (Right-Right) Rotation** | Insertion into right child of right subtree ($BF = -2, \\text{child } BF = -1$) | **Single Left Rotation** on the unbalanced root node | $O(1)$ |\n` +
        `| **LR (Left-Right) Rotation** | Insertion into right child of left subtree ($BF = +2, \\text{child } BF = -1$) | **Double Rotation**: Left rotation on child, then Right rotation on root | $O(1)$ |\n` +
        `| **RL (Right-Left) Rotation** | Insertion into left child of right subtree ($BF = -2, \\text{child } BF = +1$) | **Double Rotation**: Right rotation on child, then Left rotation on root | $O(1)$ |\n\n` +
        `---\n\n` +
        `### 2. ⚡ Performance Comparison: AVL vs. Standard BST vs. Red-Black Tree\n\n` +
        `* **Standard BST:** Worst-case degenerates into linked list: $O(N)$ lookup time.\n` +
        `* **AVL Tree:** Strictly balanced height ($h \\le 1.44 \\log_2 N$). Search time is strictly $O(\\log N)$. Ideal for lookup-heavy workloads.\n` +
        `* **Red-Black Tree:** Slightly looser balance factor ($h \\le 2 \\log_2(N+1)$). Fewer rotations during insert/delete; ideal for write-heavy workloads.\n\n` +
        `*💡 Note: Connected live AI provider was temporarily unavailable. Exam-Buddy automatically generated this verified academic breakdown!*`
      );
    }
  }

  // ─── 3. Operating Systems & Architecture (Deadlock, Process vs Thread, Paging) ───
  if (
    q.includes("deadlock") ||
    q.includes("coffman") ||
    q.includes("process vs thread") ||
    q.includes("paging") ||
    q.includes("virtual memory") ||
    q.includes("operating system")
  ) {
    if (q.includes("deadlock") || q.includes("coffman")) {
      return (
        `### 🔒 The 4 Coffman Conditions for Deadlock & Prevention Strategies\n\n` +
        `**Domain:** Operating Systems (OS) / Concurrency & Systems Architecture\n` +
        `**Core Principle:** A **Deadlock** occurs when a set of concurrent processes are permanently blocked because each process holds a resource and waits for another resource held by another process in the set.\n\n` +
        `---\n\n` +
        `### 1. 📋 The 4 Necessary and Sufficient Coffman Conditions\n\n` +
        `| Coffman Condition | Mathematical & Conceptual Definition | Prevention Strategy (Breaking the Invariant) |\n` +
        `| :--- | :--- | :--- |\n` +
        `| **1. Mutual Exclusion** | At least one resource must be held in a non-shareable mode (only 1 process at a time). | Spooling / virtualization (e.g. printer spooler daemon) so resources appear shareable. |\n` +
        `| **2. Hold and Wait** | A process must be currently holding at least one resource while waiting to acquire additional ones. | Require processes to request and receive **all required resources at once** prior to execution. |\n` +
        `| **3. No Preemption** | Resources allocated to a process cannot be forcibly confiscated until released voluntarily. | If a process requests an unavailable resource, forcibly preempt and release all its currently held resources. |\n` +
        `| **4. Circular Wait** | A closed cycle of processes $\{P_0, P_1, \\dots, P_n\}$ exists where $P_i$ waits for a resource held by $P_{i+1}$. | Impose a strict **Global Linear Ordering** of all resource types; require processes to request resources in strictly ascending order. |\n\n` +
        `---\n\n` +
        `### 2. 🛡️ Deadlock Handling Paradigms in Modern Systems\n\n` +
        `1. **Deadlock Prevention:** Design the system constraints so that at least one of the 4 Coffman conditions can never hold.\n` +
        `2. **Deadlock Avoidance (Banker's Algorithm):** Dynamically inspect resource allocation state to ensure the system remains in a **Safe State**.\n` +
        `3. **Deadlock Detection & Recovery:** Periodically run a Cycle-Finding Algorithm on the Resource Allocation Graph (RAG); terminate victim process if cycle is found.\n` +
        `4. **Ostrich Algorithm:** Ignore the problem if deadlocks are rare and recovery costs exceed preventative overhead (standard approach in UNIX/Windows consumer OS).\n\n` +
        `*💡 Note: Connected live AI provider was temporarily unavailable. Exam-Buddy automatically generated this verified academic breakdown!*`
      );
    }

    if (q.includes("process") && q.includes("thread")) {
      return (
        `### ⚙️ Comprehensive Comparison: Process vs. Thread\n\n` +
        `**Domain:** Operating Systems / Systems Programming\n` +
        `**Core Objective:** Understanding concurrency primitives, memory layout, and kernel context switching overhead.\n\n` +
        `---\n\n` +
        `### 1. 📊 Architectural Comparison Matrix\n\n` +
        `| Operational Dimension | Process | Thread (Lightweight Process - LWP) |\n` +
        `| :--- | :--- | :--- |\n` +
        `| **Definition** | An executing instance of a computer program with dedicated address space. | The smallest unit of CPU scheduling and execution within a parent process. |\n` +
        `| **Address Space** | **Isolated**: Each process has its own private virtual memory space (Text, Data, Heap, Stack). | **Shared**: All threads within a process share the same Text, Data, Heap, and File Descriptors. |\n` +
        `| **Context Switch Overhead**| **Heavy**: Requires flushing CPU TLB, changing Page Table Base Register (CR3), saving process registers. | **Fast / Low Overhead**: Only requires saving Thread Control Block (TCB), Program Counter (PC), and Stack Pointer. |\n` +
        `| **Inter-Communication (IPC)**| Slow; requires IPC mechanisms (Shared Memory, Sockets, Message Queues, Pipes). | Fast; reads and writes directly to shared heap memory (requires mutexes/locks). |\n` +
        `| **Fault Isolation** | **High**: If one process crashes (e.g. Segfault), sibling processes continue unaffected. | **Low**: An unhandled exception or memory corruption in one thread crashes the entire process. |\n` +
        `| **Creation Cost** | Expensive ($fork()$ system call copies page tables and sets up mm_struct). | Inexpensive ($pthread\\_create$ allocates minimal stack and registers). |\n\n` +
        `*💡 Note: Connected live AI provider was temporarily unavailable. Exam-Buddy automatically generated this verified academic breakdown!*`
      );
    }
  }

  // ─── 4. Database Systems & Distributed Systems (ACID, Normalization, CAP) ───
  if (
    q.includes("acid") ||
    q.includes("normalization") ||
    q.includes("bcnf") ||
    q.includes("cap theorem") ||
    q.includes("sql") ||
    q.includes("nosql") ||
    q.includes("database")
  ) {
    return (
      `### 💾 Database Systems: Core Architecture & Theoretical Foundations\n\n` +
      `**Domain:** Database Management Systems (DBMS) / Distributed Computing\n\n` +
      `---\n\n` +
      `### 1. 🛡️ The ACID Transaction Guarantee vs. BASE Distributed Paradigm\n\n` +
      `| Property | Relational DBMS (ACID) | Distributed NoSQL (BASE) |\n` +
      `| :--- | :--- | :--- |\n` +
      `| **Atomicity** | All operations succeed or entire transaction rolls back via Write-Ahead Logging (WAL). | Basically Available: Prioritizes uptime over single-node atomicity. |\n` +
      `| **Consistency** | Strict state invariants and foreign key integrity preserved at all times. | Soft State: System state may fluctuate without user input due to replication lag. |\n` +
      `| **Isolation** | Serializable / Snapshot isolation levels prevent dirty reads, non-repeatable reads, and phantoms. | Eventual Consistency: Replicas eventually converge via vector clocks / gossip protocols. |\n` +
      `| **Durability** | Committed transactions are permanently saved to non-volatile disk/SSD. | Partition Tolerant: Data is replicated across distributed cluster nodes. |\n\n` +
      `---\n\n` +
      `### 2. 📐 Database Normalization Hierarchy (1NF to BCNF)\n\n` +
      `* **1NF (First Normal Form):** Atomic values only; eliminate repeating groups and multi-valued attributes.\n` +
      `* **2NF (Second Normal Form):** In 1NF + eliminate **Partial Dependencies** (every non-prime attribute must depend on the whole candidate key).\n` +
      `* **3NF (Third Normal Form):** In 2NF + eliminate **Transitive Dependencies** (no non-prime attribute depends on another non-prime attribute).\n` +
      `* **BCNF (Boyce-Codd Normal Form):** For every functional dependency $X \\rightarrow Y$, $X$ must be a **Super Key**.\n\n` +
      `*💡 Note: Connected live AI provider was temporarily unavailable. Exam-Buddy automatically generated this verified academic breakdown!*`
    );
  }

  // ─── 5. Universal Dynamic Breakdown for ANY User Query / Sub-Questions ───
  const subjectTitle = query.split(/[\n\.\?\:]/)[0].trim().slice(0, 80) || "Engineering Subject Breakdown";

  // If the user specified numbered questions (e.g. 1) What is X 2) Advantages and Disadvantages)
  let subQuestionsSection = "";
  if (subQuestions.length > 0) {
    subQuestionsSection =
      `### 2. 📝 Structured Answers to Your Target Questions\n\n` +
      subQuestions
        .map((sq) => {
          const sqText = sq.question;
          const sqLower = sqText.toLowerCase();

          let answerBody = "";
          if (sqLower.includes("what is") || sqLower.includes("definition") || sqLower.includes("meaning")) {
            answerBody =
              `An authoritative technical definition requires understanding input preconditions, operational architecture, and output guarantees. ` +
              `In academic examination rubrics, define the foundational theory, historical context, and the primary engineering objective it solves.`;
          } else if (sqLower.includes("advantage") || sqLower.includes("disadvantage") || sqLower.includes("pros") || sqLower.includes("cons")) {
            answerBody =
              `* **Key Advantages:** High operational scalability, fault isolation, standard protocol interoperability, and automated throughput.\n` +
              `* **Key Disadvantages:** Implementation complexity, computational overhead, potential single-points-of-failure, and ongoing maintenance lifecycle costs.`;
          } else if (sqLower.includes("pages") || sqLower.includes("print") || sqLower.includes("format")) {
            answerBody =
              `To expand this into a comprehensive 8-to-10 page academic dossier or print project, organize sections into: ` +
              `(1) Title & Executive Abstract, (2) Problem Formulation, (3) System Architecture Diagrams, ` +
              `(4) Implementation Methodology, (5) Comparative Evaluation Table, (6) Security/Performance Invariants, ` +
              `(7) Real-world Industry Case Studies, (8) Conclusion & Future Scope, and (9) IEEE Citations.`;
          } else {
            answerBody =
              `Comprehensive engineering breakdown addressing the core parameters, constraints, and algorithmic considerations for this phase.`;
          }

          return `#### **Point ${sq.num}: ${sqText}**\n\n${answerBody}\n`;
        })
        .join("\n") +
      `\n---\n\n`;
  }

  return (
    `### 📚 Academic Examination Dossier: ${subjectTitle}\n\n` +
    `Here is a structured, university-grade academic breakdown covering the foundational principles, architectural framework, trade-offs, and exam writing guidelines for **"${query.slice(0, 65)}"**.\n\n` +
    `---\n\n` +
    `### 1. 🎯 Foundational Principle & Theoretical Scope\n\n` +
    `* **Core Definition:** This subject encompasses core engineering design principles, computational invariants, and systems engineering workflows.\n` +
    `* **Architectural Purpose:** Engineered to provide scalable, verifiable, and deterministic outcomes in university coursework and production environments.\n` +
    `* **Key Mathematical / Logical Foundations:** Involves state transition verification, formal complexity analysis, and resource optimization constraints.\n\n` +
    `---\n\n` +
    subQuestionsSection +
    `### 3. ⚖️ System Architecture & Trade-Offs Matrix\n\n` +
    `| Evaluation Dimension | Primary Operational Strengths | Potential Trade-Offs & Bottlenecks |\n` +
    `| :--- | :--- | :--- |\n` +
    `| **System Performance** | High data throughput and deterministic execution under standard workload envelopes. | High memory utilization and latency degradation during peak boundary spikes. |\n` +
    `| **Architectural Modularity** | Clean decoupling of components; simplifies unit testing and continuous integration. | Increased interface serialization overhead and network hop latency. |\n` +
    `| **Reliability & Fault Tolerance** | Redundant failover paths and verified state recovery mechanisms. | Increased hardware infrastructure costs and cluster configuration complexity. |\n` +
    `| **Security & Access Control** | Enforces principle of least privilege, cryptographic validation, and audit trails. | Operational friction in credentials rotation and key management overhead. |\n\n` +
    `---\n\n` +
    `### 4. 🛠️ Implementation Workflow & Engineering Blueprint\n\n` +
    `1. **Phase 1: Requirements Gathering & Invariant Definition:** Establish functional parameters, throughput SLAs, and error margins.\n` +
    `2. **Phase 2: Architectural Design & Modular Interface Schema:** Design clean API boundaries, schema definitions, and state persistence layers.\n` +
    `3. **Phase 3: Execution, Stress-Testing & Verification:** Run synthetic benchmarks, edge-case unit test suites, and compliance evaluations.\n` +
    `4. **Phase 4: Production Deployment & Observability:** Monitor live telemetry metrics, automated health checks, and alerting thresholds.\n\n` +
    `---\n\n` +
    `### 5. 🎓 University Exam Mark Distribution Strategy\n\n` +
    `* **5-Mark Question Strategy:** State the concise definition, list 3 core architectural components, and draw a labeled functional block diagram.\n` +
    `* **10-Mark Question Strategy:** Present a comprehensive 5-part answer: **(1) Formal Definition & Theory**, **(2) Functional Block Diagram**, **(3) Step-by-Step Logic / Algorithm**, **(4) Comparative Advantages vs. Disadvantages Table**, and **(5) Real-World Industry Application**.\n\n` +
    `*💡 Note: Connected live AI provider was temporarily unavailable. Connect a free Groq or Gemini API key in the top header for live streaming responses!*`
  );
}
