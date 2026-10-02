'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Target,
  Sparkles,
  Lock,
  Unlock,
  RotateCcw,
  Fingerprint,
  Award,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DailySecurityModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface ImageSpot {
  id: number;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  label: string;
}

// Preset Security Images with built-in default spots
const PRESET_SECURITY_IMAGES = [
  {
    id: 'cyber-car',
    name: '🏎️ Cyber Supercar',
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1000&auto=format&fit=crop',
    defaultSpots: [
      { id: 1, x: 58, y: 44, label: 'Car Window' },
      { id: 2, x: 28, y: 72, label: 'Front Tyre' },
      { id: 3, x: 84, y: 62, label: 'LED Headlight' },
    ],
  },
  {
    id: 'tech-setup',
    name: '💻 Cyberpunk Desk Setup',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
    defaultSpots: [
      { id: 1, x: 50, y: 35, label: 'Main Display' },
      { id: 2, x: 45, y: 75, label: 'RGB Keyboard' },
      { id: 3, x: 80, y: 78, label: 'Gaming Mouse' },
    ],
  },
  {
    id: 'space-core',
    name: '🌌 Sci-Fi Portal Engine',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
    defaultSpots: [
      { id: 1, x: 50, y: 50, label: 'Orb Core' },
      { id: 2, x: 78, y: 32, label: 'Upper Satellite' },
      { id: 3, x: 25, y: 70, label: 'Energy Ring' },
    ],
  },
];

export function DailySecurityModal({ isOpen, onClose }: DailySecurityModalProps) {
  const {
    user,
    unlockDailySecurity,
    isDailyUnlocked,
  } = useAuth();

  const [unlocked, setUnlocked] = useState(false);
  const [streakCount, setStreakCount] = useState(7);

  // --- IMAGE SPOT TAP SECURITY STATE ---
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [isUsingCustomImage, setIsUsingCustomImage] = useState<boolean>(false);

  // Spots configuration (Target sequence of x%, y%)
  const [targetSpots, setTargetSpots] = useState<ImageSpot[]>(
    PRESET_SECURITY_IMAGES[0].defaultSpots
  );
  const [userTappedSpots, setUserTappedSpots] = useState<{ x: number; y: number; spotId: number }[]>([]);
  const [imageTapSuccess, setImageTapSuccess] = useState<boolean>(false);
  const [imageTapMessage, setImageTapMessage] = useState<string>(
    'Tap the secret spots on the image in sequence (e.g. Window ➔ Tyre ➔ Headlight)'
  );

  // Customizing Spots Mode
  const [isConfiguringSpots, setIsConfiguringSpots] = useState<boolean>(false);
  const [newDraftSpots, setNewDraftSpots] = useState<ImageSpot[]>([]);
  const [showTargetHintPins, setShowTargetHintPins] = useState<boolean>(true);

  // Image Ref for calculating click coordinates
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Sync saved spots from LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedImageSpots = localStorage.getItem('exambuddy_image_spots');
      if (storedImageSpots) {
        try {
          const parsed = JSON.parse(storedImageSpots);
          if (Array.isArray(parsed) && parsed.length >= 3) {
            setTargetSpots(parsed);
          }
        } catch {}
      }
      const storedImageChoice = localStorage.getItem('exambuddy_security_image');
      if (storedImageChoice) {
        if (storedImageChoice.startsWith('http')) {
          setCustomImageUrl(storedImageChoice);
          setIsUsingCustomImage(true);
        } else {
          const foundIdx = PRESET_SECURITY_IMAGES.findIndex((img) => img.id === storedImageChoice);
          if (foundIdx !== -1) setSelectedImageIndex(foundIdx);
        }
      }
    }
  }, []);

  // Reset modal state
  const resetImageTapGame = () => {
    setUserTappedSpots([]);
    setImageTapSuccess(false);
    setImageTapMessage(
      `Tap ${targetSpots.length} secret spots on the image in sequence!`
    );
  };

  useEffect(() => {
    if (isOpen) {
      resetImageTapGame();
      setUnlocked(isDailyUnlocked);
    }
  }, [isOpen, isDailyUnlocked]);

  if (!isOpen) return null;

  const currentImageObj = isUsingCustomImage && customImageUrl
    ? { id: 'custom', name: '📷 Custom Image', url: customImageUrl }
    : PRESET_SECURITY_IMAGES[selectedImageIndex];

  // --- HANDLE CLICKS ON THE SECURITY IMAGE ---
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || imageTapSuccess) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel to percentage (0-100)
    const percentX = Math.round((clickX / rect.width) * 100);
    const percentY = Math.round((clickY / rect.height) * 100);

    // MODE A: SETTING NEW CUSTOM SPOTS
    if (isConfiguringSpots) {
      if (newDraftSpots.length >= 5) {
        setImageTapMessage('Maximum 5 spots set. Click "Save & Lock Spots"');
        return;
      }

      const defaultLabels = ['Car Window', 'Tyre', 'Headlight', 'Door Handle', 'Mirror'];
      const spotNum = newDraftSpots.length + 1;
      const spotLabel = defaultLabels[spotNum - 1] || `Spot #${spotNum}`;

      const updatedDraft = [
        ...newDraftSpots,
        { id: spotNum, x: percentX, y: percentY, label: spotLabel },
      ];
      setNewDraftSpots(updatedDraft);
      setImageTapMessage(
        `Set Spot #${spotNum} at (${percentX}%, ${percentY}%). Add ${
          Math.max(0, 3 - updatedDraft.length)
        } more...`
      );
      return;
    }

    // MODE B: UNLOCKING TAP SEQUENCE
    const nextRequiredIndex = userTappedSpots.length;
    if (nextRequiredIndex >= targetSpots.length) return;

    const targetSpot = targetSpots[nextRequiredIndex];

    // Distance calculation in % space (Tolerance radius of ~14%)
    const dist = Math.sqrt(
      Math.pow(percentX - targetSpot.x, 2) + Math.pow(percentY - targetSpot.y, 2)
    );

    const TOLERANCE_RADIUS = 14;

    if (dist <= TOLERANCE_RADIUS) {
      // SUCCESSFUL HIT ON NEXT SPOT!
      const updatedHits = [
        ...userTappedSpots,
        { x: targetSpot.x, y: targetSpot.y, spotId: targetSpot.id },
      ];
      setUserTappedSpots(updatedHits);

      if (updatedHits.length === targetSpots.length) {
        setImageTapSuccess(true);
        setUnlocked(true);
        setImageTapMessage('🎉 100% IMAGE SPOTS VERIFIED! Unlocking Exam-Buddy...');
        setTimeout(() => {
          unlockDailySecurity();
        }, 1400);
      } else {
        setImageTapMessage(
          `✅ Spot ${updatedHits.length}/${targetSpots.length} (${targetSpot.label}) Hit! Tap spot #${
            updatedHits.length + 1
          }...`
        );
      }
    } else {
      // MISSED SPOT TAP
      setImageTapMessage(
        `❌ Tap missed spot #${nextRequiredIndex + 1} (${targetSpot.label}). Resetting sequence...`
      );
      setTimeout(() => {
        setUserTappedSpots([]);
        setImageTapMessage(`Try again: Tap Spot #1 (${targetSpots[0]?.label}) on the image!`);
      }, 900);
    }
  };

  // Save Configured Draft Spots
  const saveCustomSpots = () => {
    if (newDraftSpots.length < 3) {
      setImageTapMessage('Please set at least 3 spots on the image!');
      return;
    }
    setTargetSpots(newDraftSpots);
    setIsConfiguringSpots(false);
    setUserTappedSpots([]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('exambuddy_image_spots', JSON.stringify(newDraftSpots));
    }
    setImageTapMessage(`🎉 Saved ${newDraftSpots.length} custom security spots! Now test to unlock.`);
  };

  const handleSelectPresetImage = (index: number) => {
    setSelectedImageIndex(index);
    setIsUsingCustomImage(false);
    const newPreset = PRESET_SECURITY_IMAGES[index];
    setTargetSpots(newPreset.defaultSpots);
    setUserTappedSpots([]);
    setImageTapSuccess(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('exambuddy_security_image', newPreset.id);
      localStorage.removeItem('exambuddy_image_spots');
    }
    setImageTapMessage(`Loaded ${newPreset.name}. Tap secret spots: ${newPreset.defaultSpots.map(s => s.label).join(' ➔ ')}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0b0d19] border border-violet-500/30 rounded-3xl shadow-2xl p-5 text-slate-100 overflow-hidden my-6">
        {/* Ambient Neon Glows */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-violet-600/40 to-indigo-600/40 rounded-2xl text-violet-400 border border-violet-500/40 shadow-lg shadow-violet-600/20">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-tight">
                  Daily Security Verification
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {user?.user_metadata?.provider_type === 'google' ? 'Google Account Verified' : 'Daily Gate'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tap secret image spots (e.g. Car Window, Tyre) to unlock access
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Identity Banner */}
        <div className="mt-3 p-2.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white ring-2 ring-violet-400/40">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'G'}
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span>{user?.user_metadata?.full_name || user?.email || 'Logged In Student'}</span>
                {user?.user_metadata?.provider_type === 'google' && (
                  <span className="text-[10px] text-blue-400 font-medium">Google Verified</span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {user?.email || 'student@campus.edu'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{streakCount} Day Streak</span>
          </div>
        </div>

        {/* --- MAIN GAME CONTAINER --- */}
        <div className="mt-3 p-3 bg-[#0d0f1f] border border-white/10 rounded-2xl relative overflow-hidden space-y-3">
          {/* Image Preset & Custom Spot Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Preset Image Selectors */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {PRESET_SECURITY_IMAGES.map((preset, idx) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPresetImage(idx)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all shrink-0 ${
                    !isUsingCustomImage && selectedImageIndex === idx
                      ? 'bg-violet-600 text-white border-violet-400 shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTargetHintPins(!showTargetHintPins)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                title="Toggle secret target markers view"
              >
                {showTargetHintPins ? (
                  <Eye className="w-3.5 h-3.5 text-violet-400" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{showTargetHintPins ? 'Hints On' : 'Hints Off'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsConfiguringSpots(!isConfiguringSpots);
                  setNewDraftSpots([]);
                  setUserTappedSpots([]);
                  if (!isConfiguringSpots) {
                    setImageTapMessage('Click 3+ spots on the image (e.g., Window, Tyre, Headlight) to lock!');
                  } else {
                    resetImageTapGame();
                  }
                }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline"
              >
                <Target className="w-3.5 h-3.5" />
                <span>{isConfiguringSpots ? 'Cancel Setup' : 'Set Custom Spots'}</span>
              </button>
            </div>
          </div>

          {/* Status Banner */}
          <div
            className={`p-2 rounded-xl text-xs flex items-center justify-between border ${
              imageTapSuccess
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold'
                : isConfiguringSpots
                ? 'bg-violet-950/60 border-violet-500/40 text-violet-200'
                : 'bg-slate-900 border-white/10 text-slate-200'
            }`}
          >
            <span className="truncate pr-2">{imageTapMessage}</span>
            <div className="flex items-center gap-2 shrink-0">
              {isConfiguringSpots ? (
                <button
                  type="button"
                  onClick={saveCustomSpots}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold rounded-lg text-[10px] uppercase transition-colors"
                >
                  Save Spots ({newDraftSpots.length})
                </button>
              ) : (
                <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded-md text-slate-300">
                  {userTappedSpots.length} / {targetSpots.length} Spots Hit
                </span>
              )}
            </div>
          </div>

          {/* Target Sequence Hint Bar */}
          {!isConfiguringSpots && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 rounded-xl border border-white/5 text-xs">
              <span className="text-slate-400 text-[11px]">Secret Spot Sequence:</span>
              <div className="flex items-center gap-2">
                {targetSpots.map((spot, idx) => {
                  const isHit = userTappedSpots.some((h) => h.spotId === spot.id);
                  return (
                    <div
                      key={spot.id}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold transition-all ${
                        isHit
                          ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400 scale-105'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <span>#{spot.id}</span>
                      <span className="font-sans">{spot.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* INTERACTIVE SECURITY IMAGE CANVAS DISPLAY */}
          <div
            ref={imageContainerRef}
            onClick={handleImageClick}
            className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-violet-500/30 shadow-2xl cursor-crosshair group select-none bg-slate-950"
          >
            {/* Background Security Image */}
            <img
              src={currentImageObj.url}
              alt="Security Spot Lock Image"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

            {/* Target Secret Spots Pins (When Hints On or Configuring) */}
            {(showTargetHintPins || isConfiguringSpots) &&
              (isConfiguringSpots ? newDraftSpots : targetSpots).map((spot, idx) => {
                const isHit = userTappedSpots.some((h) => h.spotId === spot.id);
                return (
                  <div
                    key={spot.id}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex flex-col items-center animate-in zoom-in duration-200"
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs shadow-lg transition-all ${
                        isHit
                          ? 'bg-emerald-500 border-white text-slate-950 scale-115 ring-4 ring-emerald-400/50'
                          : isConfiguringSpots
                          ? 'bg-violet-600 border-white text-white animate-bounce'
                          : 'bg-amber-500/80 border-amber-200 text-slate-950 shadow-amber-500/50'
                      }`}
                    >
                      🎯 #{spot.id}
                    </div>
                    <span className="mt-1 px-1.5 py-0.5 rounded-md bg-black/80 text-white font-semibold text-[9px] border border-white/20 whitespace-nowrap">
                      {spot.label}
                    </span>
                  </div>
                );
              })}

            {/* Tapped Hit Markers Visual Ripples */}
            {userTappedSpots.map((hit, idx) => (
              <div
                key={idx}
                style={{ left: `${hit.x}%`, top: `${hit.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
              >
                <div className="w-10 h-10 rounded-full border-2 border-emerald-400 bg-emerald-500/40 animate-ping" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-300 drop-shadow-md" />
                </div>
              </div>
            ))}

            {/* Mode Overlay Instruction */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-none">
              <span className="flex items-center gap-1.5 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {isConfiguringSpots
                  ? 'Tap points on the image to set custom spots'
                  : 'Click secret image landmarks in order'}
              </span>
              <span className="font-mono text-[10px] text-violet-300">
                Image: {currentImageObj.name}
              </span>
            </div>
          </div>

          {/* Custom Image URL Input option */}
          <div className="pt-1 flex items-center gap-2">
            <input
              type="text"
              value={customImageUrl}
              onChange={(e) => {
                setCustomImageUrl(e.target.value);
                if (e.target.value.trim().startsWith('http')) {
                  setIsUsingCustomImage(true);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('exambuddy_security_image', e.target.value.trim());
                  }
                }
              }}
              placeholder="Paste custom image URL (or photo link)..."
              className="flex-1 bg-[#121424] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <button
              type="button"
              onClick={() => {
                if (customImageUrl.trim()) {
                  setIsUsingCustomImage(true);
                  resetImageTapGame();
                }
              }}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Use Photo</span>
            </button>
          </div>
        </div>

        {/* Bottom Unlock Button */}
        <div className="mt-4 space-y-2">
          {unlocked ? (
            <button
              type="button"
              onClick={unlockDailySecurity}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 animate-bounce"
            >
              <Unlock className="w-4 h-4" />
              <span>ACCESS GRANTED • ENTER EXAM-BUDDY</span>
            </button>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={unlockDailySecurity}
                className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Bypass (Demo Access)</span>
              </button>
            </div>
          )}

          <p className="text-[11px] text-slate-500 text-center">
            🔐 Daily Security resets every 24 hours. Image spot patterns are encrypted.
          </p>
        </div>
      </div>
    </div>
  );
}
