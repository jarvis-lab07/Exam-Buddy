"use client";

import React, { useState, useRef, useEffect } from "react";
import { Music, Play, Pause, Volume2, VolumeX, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

const LOFI_TRACKS = [
  {
    title: "Midnight Study",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
  },
  {
    title: "Rainy Cafe",
    url: "https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b3cb39e9.mp3",
  },
  {
    title: "Quiet Focus",
    url: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_244a5e01b3.mp3",
  }
];

export function AmbientPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(LOFI_TRACKS[currentTrackIndex].url);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const toggleMute = () => setIsMuted(!isMuted);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % LOFI_TRACKS.length);
    setIsPlaying(true);
  };

  return (
    <div className="card p-3">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-indigo-900 to-violet-900 flex items-center justify-center border border-white/10">
           {isPlaying ? (
             <div className="flex items-end justify-center gap-0.5 h-4">
                <span className="w-1 bg-violet-400 rounded-full animate-[bounce_1s_infinite]" />
                <span className="w-1 bg-violet-400 rounded-full animate-[bounce_1s_infinite_0.2s]" />
                <span className="w-1 bg-violet-400 rounded-full animate-[bounce_1s_infinite_0.4s]" />
             </div>
           ) : (
             <Music className="w-4 h-4 text-violet-300" />
           )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#F1F1F8] truncate">
            {LOFI_TRACKS[currentTrackIndex].title}
          </p>
          <p className="text-[10px] text-[#9B99B5]">Lo-Fi Beats</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
           <button
            onClick={togglePlay}
            className="p-1.5 rounded-md hover:bg-white/[0.06] text-[#9B99B5] hover:text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={nextTrack}
            className="p-1.5 rounded-md hover:bg-white/[0.06] text-[#9B99B5] hover:text-white transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <div className="group relative flex items-center">
             <button
              onClick={toggleMute}
              className="p-1.5 rounded-md hover:bg-white/[0.06] text-[#9B99B5] hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="absolute right-0 bottom-full mb-2 hidden group-hover:flex items-center justify-center p-2 bg-[#1A1A2E] border border-white/10 rounded-lg shadow-xl">
               <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (isMuted) setIsMuted(false);
                  }}
                  className="w-20 accent-violet-500"
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}