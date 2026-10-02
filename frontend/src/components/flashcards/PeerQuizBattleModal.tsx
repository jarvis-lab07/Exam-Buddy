'use client';

import React, { useState, useEffect } from 'react';
import {
  Swords,
  Trophy,
  Users,
  Copy,
  Check,
  Zap,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  RotateCcw,
  X,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export interface BattleQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SAMPLE_BATTLE_QUESTIONS: BattleQuestion[] = [
  {
    id: 1,
    question: 'What is the average time complexity of searching for an element in an AVL self-balancing tree?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correctIndex: 1,
    explanation: 'AVL trees maintain a strict height balance factor of [-1, 0, +1], guaranteeing logarithmic O(log N) search operations.',
  },
  {
    id: 2,
    question: 'In PostgreSQL & Supabase, which indexing technique is specifically optimized for vector similarity search (RAG)?',
    options: ['B-Tree', 'HNSW / IVFFlat', 'Hash Index', 'BRIN'],
    correctIndex: 1,
    explanation: 'Hierarchical Navigable Small World (HNSW) and IVFFlat are vector index algorithms provided by pgvector for high-dimensional embeddings.',
  },
  {
    id: 3,
    question: 'Which OSI layer handles end-to-end flow control, segment retransmission, and TCP connection establishment?',
    options: ['Network Layer (Layer 3)', 'Transport Layer (Layer 4)', 'Session Layer (Layer 5)', 'Data Link Layer (Layer 2)'],
    correctIndex: 1,
    explanation: 'Layer 4 (Transport) manages end-to-end communication, error checking, ports, and protocols like TCP and UDP.',
  },
  {
    id: 4,
    question: 'What is the primary function of the ACID "Isolation" property in Relational Database Management Systems?',
    options: [
      'Ensures transactions are written to non-volatile storage.',
      'Prevents concurrent transactions from interfering with each other.',
      'Enforces database schema constraints and foreign keys.',
      'Guarantees all-or-nothing transaction execution.',
    ],
    correctIndex: 1,
    explanation: 'Isolation ensures that execution of concurrent transactions yields the same result as sequential execution.',
  },
  {
    id: 5,
    question: 'In Spaced Repetition systems like FSRS/SM-2, what happens to the review interval when a card is rated "Easy"?',
    options: [
      'The interval stays constant.',
      'The interval is multiplied by an ease factor (> 2.0x).',
      'The card is permanently deleted.',
      'The interval decreases by 50%.',
    ],
    correctIndex: 1,
    explanation: 'Successful easy recall expands the retrievability interval geometrically using the ease factor.',
  },
];

interface PeerQuizBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PeerQuizBattleModal({ isOpen, onClose }: PeerQuizBattleModalProps) {
  const { user } = useAuth();
  const [stage, setStage] = useState<'lobby' | 'host' | 'join' | 'battle' | 'results'>('lobby');

  const [battleCode, setBattleCode] = useState('BATTLE-CS-8921');
  const [copiedLink, setCopiedLink] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // Battle Arena State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  // Opponent Simulation details
  const opponentName = 'Rohan (Classmate)';

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === 'battle' && !isAnswerSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswerSubmitted && stage === 'battle') {
      handleOptionSubmit(-1); // Timeout penalty
    }
    return () => clearInterval(timer);
  }, [stage, timeLeft, isAnswerSubmitted]);

  if (!isOpen) return null;

  const handleCreateRoom = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `BATTLE-CS-${randomNum}`;
    setBattleCode(code);
    setStage('host');
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/flashcards?battle=${battleCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleStartBattle = () => {
    setCurrentQuestionIdx(0);
    setUserScore(0);
    setOpponentScore(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setTimeLeft(15);
    setStage('battle');
  };

  const handleOptionSubmit = (optionIndex: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optionIndex);
    setIsAnswerSubmitted(true);

    const currentQ = SAMPLE_BATTLE_QUESTIONS[currentQuestionIdx];
    const isCorrect = optionIndex === currentQ.correctIndex;

    // Calculate speed bonus (up to +100 bonus pts for fast answers)
    const points = isCorrect ? 100 + timeLeft * 10 : 0;
    if (isCorrect) setUserScore((prev) => prev + points);

    // Simulate opponent answer logic
    const opponentCorrect = Math.random() > 0.35;
    const opponentSpeed = Math.floor(Math.random() * 8) + 4;
    const oppPoints = opponentCorrect ? 100 + opponentSpeed * 10 : 0;
    if (opponentCorrect) setOpponentScore((prev) => prev + oppPoints);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx + 1 < SAMPLE_BATTLE_QUESTIONS.length) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setTimeLeft(15);
    } else {
      setStage('results');
    }
  };

  const currentQuestion = SAMPLE_BATTLE_QUESTIONS[currentQuestionIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0b0e21] border border-violet-500/30 rounded-3xl shadow-2xl p-6 text-slate-100 overflow-hidden my-6">
        {/* Glow backdrop */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-rose-600 rounded-2xl text-white shadow-lg shadow-amber-500/30">
              <Swords className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Peer Quiz Battle Arena ⚔️
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  1v1 Classroom Match
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Challenge your batchmates to shareable timed practice test battles!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STAGE 1: LOBBY CHOICE */}
        {stage === 'lobby' && (
          <div className="mt-6 space-y-6 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Host a battle */}
              <button
                onClick={handleCreateRoom}
                className="p-6 bg-gradient-to-br from-violet-900/40 to-indigo-900/40 hover:from-violet-900/60 hover:to-indigo-900/60 border-2 border-violet-500/40 hover:border-violet-400 rounded-3xl text-left transition-all group shadow-xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Host a Battle Room</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Generate a shareable 10-question challenge link for your college WhatsApp group.
                </p>
              </button>

              {/* Option B: Join a battle */}
              <div className="p-6 bg-gradient-to-br from-slate-900 to-[#12142d] border-2 border-white/10 rounded-3xl flex flex-col justify-between shadow-xl">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Join Challenge Room</h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Enter the battle room code shared by your classmate.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. BATTLE-CS-8921"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-[#181a38] border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={handleStartBattle}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: HOST ROOM WAITING SCREEN */}
        {stage === 'host' && (
          <div className="mt-6 space-y-5 text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-600/20 border-2 border-violet-500/40 text-violet-400 animate-bounce">
              <Share2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white">Your Battle Room is Ready!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Share this room code with your friend to compete live in real-time.
              </p>
            </div>

            {/* Room Code Display box */}
            <div className="p-4 bg-[#12152e] border border-violet-500/40 rounded-2xl max-w-md mx-auto space-y-3">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
                Shareable Challenge Code
              </span>
              <div className="text-2xl font-black text-amber-400 font-mono tracking-widest bg-black/40 py-2 rounded-xl border border-white/10">
                {battleCode}
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-violet-600/30"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Challenge Link Copied!' : 'Copy Battle Link'}</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={handleStartBattle}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 mx-auto"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Start Practice Battle Now</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: LIVE 1V1 BATTLE ARENA */}
        {stage === 'battle' && currentQuestion && (
          <div className="mt-4 space-y-4">
            {/* Live Scoreboards Banner */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#0e1026] border border-white/10 rounded-2xl">
              {/* Player 1 (You) */}
              <div className="flex items-center gap-3 p-2 bg-violet-950/40 border border-violet-500/30 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white text-xs ring-2 ring-violet-400">
                  {user?.email?.charAt(0).toUpperCase() || 'YOU'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">You</div>
                  <div className="text-sm font-black text-amber-400 font-mono">
                    {userScore} <span className="text-[10px] text-slate-400">pts</span>
                  </div>
                </div>
              </div>

              {/* Player 2 (Opponent) */}
              <div className="flex items-center gap-3 p-2 bg-rose-950/40 border border-rose-500/30 rounded-xl justify-end">
                <div className="text-right">
                  <div className="text-xs font-bold text-white">{opponentName}</div>
                  <div className="text-sm font-black text-rose-400 font-mono">
                    {opponentScore} <span className="text-[10px] text-slate-400">pts</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-rose-600 flex items-center justify-center font-bold text-white text-xs ring-2 ring-rose-400">
                  R
                </div>
              </div>
            </div>

            {/* Question Progress & Timer */}
            <div className="flex items-center justify-between px-2 text-xs">
              <span className="text-slate-400 font-semibold">
                Question {currentQuestionIdx + 1} of {SAMPLE_BATTLE_QUESTIONS.length}
              </span>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="p-4 bg-[#12142e] border border-violet-500/30 rounded-2xl space-y-3">
              <h3 className="text-base font-extrabold text-white leading-relaxed">
                {currentQuestion.question}
              </h3>

              {/* Options Grid */}
              <div className="space-y-2 pt-2">
                {currentQuestion.options.map((option, idx) => {
                  let btnStyle = 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200';

                  if (isAnswerSubmitted) {
                    if (idx === currentQuestion.correctIndex) {
                      btnStyle = 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold';
                    } else if (selectedOption === idx) {
                      btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-300 font-bold';
                    } else {
                      btnStyle = 'bg-white/5 opacity-40 border-transparent';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSubmit(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswerSubmitted && idx === currentQuestion.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanation & Next CTA */}
            {isAnswerSubmitted && (
              <div className="p-3 bg-violet-950/50 border border-violet-500/40 rounded-2xl space-y-2 animate-in fade-in duration-200">
                <p className="text-xs text-violet-200">
                  <span className="font-bold">Explanation:</span> {currentQuestion.explanation}
                </p>

                <button
                  onClick={handleNextQuestion}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs uppercase transition-colors flex items-center justify-center gap-2"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STAGE 4: BATTLE RESULTS & VICTORY TROPHY */}
        {stage === 'results' && (
          <div className="mt-6 space-y-6 text-center py-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">
                {userScore >= opponentScore ? '🎉 VICTORY! You Won the Battle!' : '👏 Great Match! Nice Effort!'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Final classroom leaderboard results for battle <span className="font-mono text-violet-400">{battleCode}</span>
              </p>
            </div>

            {/* Score Comparison Box */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-[#11132b] border border-white/10 rounded-2xl max-w-md mx-auto">
              <div className="p-3 bg-violet-950/40 border border-violet-500/30 rounded-xl">
                <div className="text-xs text-slate-400 font-semibold">Your Score</div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">{userScore}</div>
              </div>

              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl">
                <div className="text-xs text-slate-400 font-semibold">{opponentName}</div>
                <div className="text-2xl font-black text-rose-400 font-mono mt-1">{opponentScore}</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleStartBattle}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Rematch Battle</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Close Arena
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
