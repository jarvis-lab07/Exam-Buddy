"use client";

import React, { useState } from "react";
import { HelpCircle, Sparkles, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { aiGateway } from "@/lib/ai-gateway";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface LectureQuizPanelProps {
  lectureTitle: string;
}

export function LectureQuizPanel({ lectureTitle }: LectureQuizPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: "q-1",
      question: "What is the maximum allowed Balance Factor in a valid AVL Tree?",
      options: ["+1 or -1", "+2 or -2", "0 only", "Any positive integer"],
      correctIndex: 0,
      explanation: "AVL trees maintain strict height balance where every node's balance factor (Height_Left - Height_Right) must be -1, 0, or +1.",
    },
    {
      id: "q-2",
      question: "Which rotation is required when a node is inserted into the right subtree of a left child?",
      options: ["Single LL Rotation", "Single RR Rotation", "Left-Right (LR) Double Rotation", "Right-Left (RL) Double Rotation"],
      correctIndex: 2,
      explanation: "An LR rotation is performed when an imbalance occurs due to insertion into the right child of a left node.",
    },
  ]);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setShowResults(false);
    setUserAnswers({});

    try {
      const res = await aiGateway.execute({
        feature: "quiz",
        messages: [
          {
            role: "system",
            content: "You are an AI quiz generator. Output ONLY a valid JSON array of 3 MCQ questions. Format: [{\"question\":\"...\", \"options\":[\"A\",\"B\",\"C\",\"D\"], \"correctIndex\":0, \"explanation\":\"...\"}]",
          },
          {
            role: "user",
            content: `Generate 3 high-yield university exam MCQ questions for the lecture "${lectureTitle}".`,
          },
        ],
      });

      if (res.text) {
        const jsonMatch = res.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setQuestions(
            parsed.map((q: any, idx: number) => ({
              id: `gen-q-${idx}-${Date.now()}`,
              question: q.question,
              options: q.options,
              correctIndex: q.correctIndex,
              explanation: q.explanation,
            }))
          );
        }
      }
    } catch (e) {
      console.error("Quiz generation failed:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (qId: string, optIdx: number) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const score = Object.entries(userAnswers).filter(
    ([qId, idx]) => questions.find((q) => q.id === qId)?.correctIndex === idx
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-white/[0.06] pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            AI Lecture Speed Quiz ({questions.length} Questions)
          </h3>
          <p className="text-[11px] text-[#9B99B5]">Test your understanding of key concepts from this lecture.</p>
        </div>

        <button
          type="button"
          onClick={handleGenerateQuiz}
          disabled={isGenerating}
          className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 fill-black" />
          {isGenerating ? "Generating Quiz..." : "Generate New Quiz"}
        </button>
      </div>

      {/* Question Cards */}
      <div className="space-y-4">
        {questions.map((q, qIdx) => {
          const selected = userAnswers[q.id];
          const isAnswered = selected !== undefined;
          const isCorrect = selected === q.correctIndex;

          return (
            <div
              key={q.id}
              className="glass-card p-4 rounded-2xl border border-white/[0.08] space-y-3 bg-white/[0.02]"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-[10px] flex items-center justify-center shrink-0">
                    {qIdx + 1}
                  </span>
                  {q.question}
                </h4>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, optIdx) => {
                  const isThisSelected = selected === optIdx;
                  const isThisCorrect = q.correctIndex === optIdx;

                  let style = "bg-white/[0.03] text-slate-300 border-white/[0.06] hover:bg-white/[0.06]";
                  if (showResults) {
                    if (isThisCorrect) {
                      style = "bg-emerald-500/20 text-emerald-200 border-emerald-500/40 font-bold";
                    } else if (isThisSelected && !isThisCorrect) {
                      style = "bg-rose-500/20 text-rose-200 border-rose-500/40";
                    }
                  } else if (isThisSelected) {
                    style = "bg-cyan-500/20 text-cyan-200 border-cyan-500/40 font-bold";
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${style}`}
                    >
                      <span className="font-mono text-[10px] opacity-75 mr-1.5">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Explanation in Results mode */}
              {showResults && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-300 space-y-1">
                  <div className="font-bold text-cyan-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Explanation:
                  </div>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit / Results Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
        {showResults ? (
          <div className="text-xs font-bold text-white flex items-center gap-2">
            Score: <span className="text-cyan-300 font-mono text-sm">{score} / {questions.length}</span> (
            {Math.round((score / questions.length) * 100)}%)
          </div>
        ) : (
          <span className="text-xs text-[#9B99B5]">Answer all questions and click Check Results</span>
        )}

        <button
          type="button"
          onClick={() => setShowResults(!showResults)}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md"
        >
          {showResults ? "Hide Results" : "Check Quiz Results"}
        </button>
      </div>
    </div>
  );
}
