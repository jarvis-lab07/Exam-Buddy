"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Copy,
  Check,
  BookmarkPlus,
  FileText,
  HelpCircle,
  Layers,
  RotateCcw,
  Languages,
  Zap,
} from "lucide-react";
import { aiGateway } from "@/lib/ai-gateway";
import { formatTimestamp, TimestampBookmark, LectureWorkspaceData } from "@/lib/youtube-service";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestampSec?: number;
}

interface LectureAiTutorProps {
  workspace: LectureWorkspaceData;
  currentTimestampSec: number;
  onSaveAsNote?: (content: string, title?: string) => void;
  onAddBookmark?: (bookmark: TimestampBookmark) => void;
  onTriggerQuiz?: () => void;
  onTriggerFlashcards?: () => void;
}

export function LectureAiTutor({
  workspace,
  currentTimestampSec,
  onSaveAsNote,
  onAddBookmark,
  onTriggerQuiz,
  onTriggerFlashcards,
}: LectureAiTutorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      role: "assistant",
      content: `Hello! I am your AI Lecture Tutor for "${workspace.title}". Ask me any doubt about the video, ask for Hindi/Hinglish explanations, or generate practice questions!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSend = async (customPrompt?: string) => {
    const userText = customPrompt || input.trim();
    if (!userText || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: userText,
      timestampSec: currentTimestampSec,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!customPrompt) setInput("");
    setIsStreaming(true);

    const assistantId = `asst-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    // Construct Context Memory Payload for AI Gateway
    const contextHeader = `
CONTEXT MEMORY:
Lecture Title: ${workspace.title}
Subject: ${workspace.subjectName || "Academic Lecture"}
Current Playback Timestamp: ${formatTimestamp(currentTimestampSec)} (${currentTimestampSec} seconds)
Active Bookmarks Count: ${workspace.bookmarks.length}
User Notes Count: ${workspace.notes.length}
    `.trim();

    try {
      let accumulated = "";
      await aiGateway.stream(
        {
          feature: "lecture_tutor",
          messages: [
            {
              role: "system",
              content: `You are an expert AI University Exam Tutor helping a student who is watching a YouTube lecture. Always refer to the current timestamp [${formatTimestamp(currentTimestampSec)}] when relevant. Give concise, highly structured academic explanations with bullet points and clear examples.`,
            },
            {
              role: "user",
              content: `${contextHeader}\n\nSTUDENT QUESTION AT TIMESTAMP [${formatTimestamp(currentTimestampSec)}]:\n${userText}`,
            },
          ],
          workspaceContext: { videoId: workspace.videoId, timestampSec: currentTimestampSec },
        },
        (chunk) => {
          accumulated += chunk;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantId ? { ...msg, content: accumulated } : msg))
          );
        }
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="glass-card rounded-2xl border border-white/[0.08] flex flex-col h-[640px] overflow-hidden bg-[#0A0A14] shadow-2xl">
      {/* Header */}
      <div className="p-3.5 bg-[#13131F] border-b border-white/[0.06] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              AI Lecture Tutor
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
                [{formatTimestamp(currentTimestampSec)}]
              </span>
            </h3>
            <p className="text-[10px] text-[#9B99B5]">Context-Aware Study Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onTriggerQuiz}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold transition-all"
            title="Generate Quiz from Lecture"
          >
            Quiz
          </button>
          <button
            type="button"
            onClick={onTriggerFlashcards}
            className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[10px] font-bold transition-all"
            title="Generate Flashcards"
          >
            Cards
          </button>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="p-2 bg-white/[0.02] border-b border-white/[0.04] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[9px] font-bold text-[#9B99B5] uppercase shrink-0 px-1">Prompts:</span>
        {[
          "Explain current topic simply",
          "Explain in Hindi/Hinglish",
          "Give a real-world example",
          "Summarize in 3 bullet points",
          "What exam questions come from this?",
        ].map((promptText) => (
          <button
            key={promptText}
            type="button"
            onClick={() => handleSend(promptText)}
            disabled={isStreaming}
            className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-slate-300 text-[10px] font-medium whitespace-nowrap transition-colors disabled:opacity-50 shrink-0"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={cn("flex flex-col space-y-1.5", isUser ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "p-3.5 rounded-2xl text-xs max-w-[88%] leading-relaxed space-y-2",
                  isUser
                    ? "bg-violet-600 text-white rounded-br-none"
                    : "glass-card border border-white/[0.08] text-slate-200 rounded-bl-none bg-white/[0.03]"
                )}
              >
                {msg.timestampSec !== undefined && (
                  <div className="text-[9px] font-mono opacity-75 mb-1 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> At [{formatTimestamp(msg.timestampSec)}]
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Message Action Bar for Assistant Responses */}
                {!isUser && msg.content && (
                  <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.06] flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 rounded text-[#9B99B5] hover:text-white hover:bg-white/[0.06] transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSaveAsNote?.(msg.content, `AI Note [${formatTimestamp(currentTimestampSec)}]`)}
                      className="p-1 rounded text-[#9B99B5] hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1 text-[9px] font-bold"
                      title="Save as Study Note"
                    >
                      <FileText className="w-3 h-3 text-violet-400" /> Note
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-[#13131F] border-t border-white/[0.06] flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder={`Ask AI Tutor about timestamp [${formatTimestamp(currentTimestampSec)}]...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0A0A14] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-all disabled:opacity-50 shrink-0 shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
