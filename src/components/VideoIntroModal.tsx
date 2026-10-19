import React, { useState, useEffect, useRef } from "react";
import { X, Volume2, VolumeX, Play, Pause } from "lucide-react";

interface VideoIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoIntroModal: React.FC<VideoIntroModalProps> = ({ isOpen, onClose }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const vid = videoRef.current;
    if (!vid) return;

    vid.currentTime = 0;
    vid.muted = isMuted;
    vid.play().catch(() => {
      // Autoplay with sound might need muted initially
      setIsMuted(true);
      vid.muted = true;
      vid.play();
    });

    const handleTimeUpdate = () => {
      if (vid.duration) {
        setProgress((vid.currentTime / vid.duration) * 100);
      }
    };

    const handleEnded = () => {
      onClose();
    };

    vid.addEventListener("timeupdate", handleTimeUpdate);
    vid.addEventListener("ended", handleEnded);

    return () => {
      vid.removeEventListener("timeupdate", handleTimeUpdate);
      vid.removeEventListener("ended", handleEnded);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10 flex flex-col justify-between">
        {/* Top bar overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Welcome to SMMC Pharmacy Pro</span>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 text-xs font-semibold transition-all"
          >
            <span>Skip Tour</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          src="/vid.mp4"
          onClick={togglePlay}
        />

        {/* Bottom controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent space-y-3">
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden backdrop-blur-sm cursor-pointer">
            <div
              className="bg-gradient-to-r from-emerald-400 to-primary h-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleMute}
                className="p-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <span className="font-mono text-white/80">{Math.round(progress)}% completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
