import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Volume2, VolumeX } from "lucide-react";

interface VideoIntroProps {
    onComplete: () => void;
}

const VideoIntro = ({ onComplete }: VideoIntroProps) => {
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const video = document.getElementById("intro-video") as HTMLVideoElement | null;
        if (!video) return;

        video.muted = isMuted;

        const updateProgress = () => {
            const percentage = (video.currentTime / video.duration) * 100;
            setProgress(percentage);
        };

        const handleCanPlay = () => {
            setIsLoading(false);
        };

        const handlePlaying = () => {
            setIsLoading(false);
        };

        video.addEventListener("timeupdate", updateProgress);
        video.addEventListener("ended", onComplete);
        video.addEventListener("canplaythrough", handleCanPlay);
        video.addEventListener("playing", handlePlaying);

        if (video.readyState >= 3) {
            setIsLoading(false);
        }

        return () => {
            video.removeEventListener("timeupdate", updateProgress);
            video.removeEventListener("ended", onComplete);
            video.removeEventListener("canplaythrough", handleCanPlay);
            video.removeEventListener("playing", handlePlaying);
        };
    }, [onComplete, isMuted]);

    const toggleMute = () => {
        setIsMuted((prev) => !prev);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            <video
                id="intro-video"
                className="w-full h-full object-contain"
                autoPlay
                playsInline
                muted={isMuted}
            >
                <source src="/vid.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50 pointer-events-none">
                {/* Top Controls */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-auto">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                        <h2 className="text-white font-semibold text-lg">Welcome to SMMC Pharmacy</h2>
                    </div>
                    <Button
                        onClick={onComplete}
                        variant="ghost"
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 gap-2"
                    >
                        <X className="w-4 h-4" />
                        Skip
                    </Button>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={toggleMute}
                            variant="ghost"
                            size="icon"
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20"
                        >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </Button>
                        <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-md">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-white text-sm font-medium min-w-[60px] text-right">
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Loading Spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        <p className="text-white text-lg">Loading video...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoIntro;
