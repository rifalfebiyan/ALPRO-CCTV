"use client"

import dynamic from "next/dynamic"

const MapVisualizer = dynamic(
    () => import('./map-visualizer').then(mod => mod.MapVisualizer),
    { ssr: false, loading: () => <div className="w-full h-[650px] bg-muted/20 animate-pulse rounded-xl border flex items-center justify-center text-muted-foreground">Initializing Geographic Data...</div> }
)

export function MapWrapper({ regions }: { regions: any[] }) {
    return <MapVisualizer regions={regions} />
}
