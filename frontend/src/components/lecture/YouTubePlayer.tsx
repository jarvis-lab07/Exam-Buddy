"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  BookmarkPlus,
  Volume2,
  VolumeX,
  Gauge,
  Maximize,
  Sparkles,
} from "lucide-react";
import { formatTimestamp } from "@/lib/youtube-service";

interface YouTubePlayerProps {
  videoId: string;
  initialTimestampSec?: number;
  onTimeUpdate?: (currentTimeSec: number) => void;
  onQuickBookmark?: (currentTimeSec: number) => void;
  seekToTimeSec?: number | null;
}

export function YouTubePlayer({
  videoId,
  initialTimestampSec = 0,
  onTimeUpdate,
  onQuickBookmark,
  seekToTimeSec,
}: YouTubePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(initialTimestampSec);
  const [durationSec, setDurationSec] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize postMessage controller or iframe listener
  useEffect(() => {
    const timer = setInterval(() => {
      // Periodic time sync simulation or postMessage payload
      if (isPlaying) {
        setCurrentTimeSec((prev) => {
          const next = prev + 1;
          onTimeUpdate?.(next);
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, onTimeUpdate]);

  // Handle external seek requests (e.g. when user clicks a timestamp bookmark!)
  useEffect(() => {
    if (seekToTimeSec !== undefined && seekToTimeSec !== null) {
      setCurrentTimeSec(seekToTimeSec);
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: "seekTo",
            args: [seekToTimeSec, true],
          }),
          "*"
        );
      }
    }
  }, [seekToTimeSec]);

  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: nextState ? "playVideo" : "pauseVideo",
          args: [],
        }),
        "*"
      );
    }
  };

  const handleJump = (seconds: number) => {
    const nextTime = Math.max(0, currentTimeSec + seconds);
    setCurrentTimeSec(nextTime);
    onTimeUpdate?.(nextTime);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: "seekTo",
          args: [nextTime, true],
        }),
        "*"
      );
    }
  };

  const handleChangePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: "setPlaybackRate",
          args: [rate],
        }),
        "*"
      );
    }
  };

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}&start=${Math.floor(initialTimestampSec)}&autoplay=0&rel=0&modestbranding=1`;

  return (
    <div className="relative w-full rounded-2xl glass-card border border-white/[0.08] overflow-hidden flex flex-col bg-[#0A0A14] shadow-2xl">
      {/* Embedded Video iFrame */}
      <div className="relative w-full aspect-video bg-black overflow-hidden group">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title="YouTube AI Lecture Player"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />

        {/* Floating Timestamp Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white font-mono text-xs font-bold flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{formatTimestamp(currentTimeSec)}</span>
        </div>

        {/* Quick Bookmark Floating Action */}
        <button
          type="button"
          onClick={() => onQuickBookmark?.(currentTimeSec)}
          className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-violet-600/90 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg border border-violet-400/40 backdrop-blur-md transition-all active:scale-95"
          title="Bookmark current timestamp"
        >
          <BookmarkPlus className="w-3.5 h-3.5" />
          <span>Bookmark ({formatTimestamp(currentTimeSec)})</span>
        </button>
      </div>

      {/* Interactive Custom Control Bar */}
      <div className="p-3 bg-[#13131F] border-t border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-all shadow-md shrink-0"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          {/* Jump -10s */}
          <button
            type="button"
            onClick={() => handleJump(-10)}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06] transition-colors"
            title="Rewind 10s"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Jump +10s */}
          <button
            type="button"
            onClick={() => handleJump(10)}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06] transition-colors"
            title="Forward 10s"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-xs font-bold text-slate-300 ml-1">
            {formatTimestamp(currentTimeSec)}
          </span>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-[#9B99B5] uppercase tracking-wider hidden sm:inline flex items-center gap-1">
            <Gauge className="w-3 h-3 text-cyan-400" /> Speed:
          </span>
          {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => handleChangePlaybackRate(rate)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                playbackRate === rate
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
