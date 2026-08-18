"use client"
import { useState, useEffect } from "react"
import { Maximize2, Video, VideoOff } from "lucide-react"

export function CameraFeed({ name, id, isOffline }: { name: string, id: string, isOffline?: boolean }) {
    const [time, setTime] = useState("")

    useEffect(() => {
        setTime(new Date().toLocaleTimeString())
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="group relative aspect-video flex-col overflow-hidden rounded-lg bg-black text-white hover:ring-2 hover:ring-primary/50 transition-all">
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-2 text-[10px] sm:text-xs font-mono">
                <div className="flex items-center gap-1 sm:gap-2">
                    {isOffline ? <VideoOff size={14} className="text-red-500 shrink-0" /> : <Video size={14} className="text-emerald-500 shrink-0" />}
                    <span className="truncate">{name}</span>
                </div>
                <span className="shrink-0">{time}</span>
            </div>

            <div className="flex h-full w-full items-center justify-center">
                {isOffline ? (
                    <div className="flex flex-col items-center text-muted-foreground space-y-2">
                        <VideoOff size={24} className="opacity-50 sm:size-8" />
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-red-500 font-semibold">Signal Lost</span>
                    </div>
                ) : (
                    <div className="relative w-full h-full bg-black flex items-center justify-center border border-zinc-800">
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover opacity-60"
                            src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[8px] sm:text-[10px] uppercase font-mono text-white z-10">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-[pulse_2s_ease-in-out_infinite]" />
                            REC
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 bg-black/40 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <button className="rounded-full bg-white/20 p-2 sm:p-3 hover:bg-white/30 transition-colors">
                    <Maximize2 size={16} className="text-white sm:w-5 sm:h-5" />
                </button>
            </div>
        </div>
    )
}
