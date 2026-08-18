"use client"
import React, { useEffect, useRef } from 'react'
import Hls from 'hls.js'

export function HlsPlayer({ src }: { src: string }) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        let hls: Hls

        // HLS.js Support Check (Windows/Android Chrome, Edge, Firefox)
        if (Hls.isSupported()) {
            hls = new Hls({
                liveSyncDurationCount: 3, // Target 3 segments latency for live stream
                maxLiveSyncPlaybackRate: 1.5, // Speed up to catch up to live edge
            })
            hls.loadSource(src)
            hls.attachMedia(video)
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(e => console.log('Autoplay blocked:', e))
            })
        }
        // Safari Native HLS Support (macOS / iOS)
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(e => console.log('Autoplay blocked:', e))
            })
        }

        return () => {
            if (hls) {
                hls.destroy()
            }
        }
    }, [src])

    return (
        <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
        />
    )
}
