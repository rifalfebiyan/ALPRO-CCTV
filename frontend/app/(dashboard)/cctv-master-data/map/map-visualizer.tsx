"use client"

import React, { useEffect, useRef, useState } from "react"
import Script from "next/script"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type RegionData = {
    name: string
    total: number
    normal: number
    warning: number
    disconnected: number
    maintenance: number
    repaired: number
    normalStores?: string[]
    repairedStores?: string[]
    warningStores?: string[]
    disconnectedStores?: string[]
    maintenanceStores?: string[]
}

const DEFAULT_COORD: [number, number] = [106.8229, -6.1944] // Jakarta Center default

export function MapVisualizer({ regions }: { regions: RegionData[] }) {
    const mapElement = useRef<HTMLDivElement>(null)
    const mapInstance = useRef<any>(null)
    const [sdkLoaded, setSdkLoaded] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [debugState, setDebugState] = useState("Initializing...")

    // UI Drilldown State
    const [drilldownData, setDrilldownData] = useState<{ region: string, status: string, stores: string[] } | null>(null)

    // Vanilla script injector to bypass Next.js Script onLoad bugs
    useEffect(() => {
        if ((window as any).tt) {
            setSdkLoaded(true)
            setDebugState("TomTom (window.tt) already loaded globally.")
            return
        }
        if (document.querySelector('#tomtom-sdk-script')) {
            setDebugState("Script tag already detected, awaiting load...")
            // Fallback interval just in case onload was eaten
            const fallbackCheck = setInterval(() => {
                if ((window as any).tt) {
                    setSdkLoaded(true)
                    clearInterval(fallbackCheck)
                }
            }, 1000)
            return
        }

        setDebugState("Injecting TomTom CDN Script DOM Element")
        const script = document.createElement('script')
        script.id = 'tomtom-sdk-script'
        script.src = "https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js"
        script.async = true
        script.onload = () => {
            setDebugState("TomTom CDN Script loaded successfully!")
            setSdkLoaded(true)
        }
        script.onerror = () => {
            setDebugState("TomTom CDN Script failed to load (CORS/Adblock?)")
            setErrorMsg("Gagal mengunduh modul TomTom dari server CDN.")
        }
        document.head.appendChild(script)
    }, [])

    useEffect(() => {
        // Expose a global hook for mapbox popup raw HTML buttons
        ; (window as any).showRegionStores = (regionName: string, status: string) => {
            const r = regions.find(x => x.name.toUpperCase() === regionName.toUpperCase())
            if (!r) return

            let stores: string[] = []
            switch (status) {
                case "Normal": stores = r.normalStores || []; break;
                case "Repaired": stores = r.repairedStores || []; break;
                case "Warning": stores = r.warningStores || []; break;
                case "Disconnected": stores = r.disconnectedStores || []; break;
                case "Maintenance": stores = r.maintenanceStores || []; break;
            }

            setDrilldownData({ region: r.name, status, stores })
        }

        return () => {
            delete (window as any).showRegionStores
        }
    }, [regions])

    useEffect(() => {
        if (!mapElement.current) {
            setDebugState(prev => prev + " | Map Element Ref is missing.")
            return;
        }
        if (!sdkLoaded) return;

        const tt = (window as any).tt;
        if (!tt) {
            setErrorMsg("TomTom script loaded but 'tt' object is missing.")
            return;
        }

        setDebugState(prev => prev + " | Invoking tt.map()")

        let localMap: any;

        try {
            localMap = tt.map({
                key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY || 'QZshd3HQrOcRK5acmZKudIdLs4WAhXNB',
                container: mapElement.current!,
                center: [106.8229, -6.1944],
                zoom: 9.5
            })

            mapInstance.current = localMap
            localMap.addControl(new tt.NavigationControl(), 'top-right')

            localMap.on('load', async () => {
                try {
                    // Build dynamic coloration matching logic
                    const matchColors: any[] = ['match', ['get', 'KAB_KOTA']]

                    regions.forEach((r) => {
                        const issues = r.warning + r.disconnected
                        const issueRatio = (issues / r.total) * 100

                        let color = "#10b981" // emerald-500 (baseline healthy)

                        if (r.total > 0 && r.maintenance === r.total) {
                            color = "#3b82f6" // blue (maintenance lockdown)
                        } else if (issueRatio > 0) {
                            if (issueRatio <= 50) {
                                // 0% to 50%: Green to Amber transition
                                const p = issueRatio / 50
                                const rCol = Math.round(16 + p * (245 - 16))
                                const gCol = Math.round(185 + p * (158 - 185))
                                const bCol = Math.round(129 + p * (11 - 129))
                                color = `rgb(${rCol}, ${gCol}, ${bCol})`
                            } else {
                                // 50% to 100%: Amber to Red transition
                                // Cap at 100 to prevent math overshoot
                                const cappedRatio = Math.min(issueRatio, 100)
                                const p = (cappedRatio - 50) / 50
                                const rCol = Math.round(245 + p * (244 - 245))
                                const gCol = Math.round(158 + p * (63 - 158))
                                const bCol = Math.round(11 + p * (94 - 11))
                                color = `rgb(${rCol}, ${gCol}, ${bCol})`
                            }
                        }

                        matchColors.push(r.name.toUpperCase(), color)
                    })
                    matchColors.push('#cbd5e1') // Default gray if unmapped

                    setDebugState(prev => prev + " | Fetching Polygons & Merging Live Data...")

                    const geoRes = await fetch('/geojson/jabodetabek.geojson')
                    const geoData = await geoRes.json()

                    localMap.addSource('jabodetabek', {
                        type: 'geojson',
                        data: geoData
                    })

                    localMap.addLayer({
                        id: 'jabodetabek-fill',
                        type: 'fill',
                        source: 'jabodetabek',
                        paint: {
                            'fill-color': matchColors,
                            'fill-opacity': 0.65
                        },
                        filter: ['==', '$type', 'Polygon']
                    })

                    localMap.addLayer({
                        id: 'jabodetabek-borders',
                        type: 'line',
                        source: 'jabodetabek',
                        paint: {
                            'line-color': '#ffffff',
                            'line-width': 1.5,
                            'line-opacity': 0.8
                        }
                    })

                    // Dedicated Point Coordinates for strictly 1 label per region
                    const LABEL_COORDS: Record<string, [number, number]> = {
                        'KOTA JAKARTA SELATAN': [106.8111, -6.2615],
                        'KOTA JAKARTA TIMUR': [106.9004, -6.2250],
                        'KOTA JAKARTA BARAT': [106.7487, -6.1683],
                        'KOTA JAKARTA UTARA': [106.8926, -6.1214],
                        'KOTA JAKARTA PUSAT': [106.8272, -6.1805],
                        'KOTA DEPOK': [106.8227, -6.4025],
                        'KOTA TANGERANG': [106.6325, -6.1702],
                        'KOTA TANGERANG SELATAN': [106.7112, -6.2886],
                        'KABUPATEN TANGERANG': [106.4673, -6.1705],
                        'KOTA BEKASI': [106.9896, -6.2383],
                        'KABUPATEN BEKASI': [107.1652, -6.3643],
                        'KOTA BOGOR': [106.7932, -6.5971],
                        'KABUPATEN BOGOR': [106.6341, -6.5518],
                        'KOTA BANDUNG': [107.6191, -6.9175],
                        'KOTA CIMAHI': [107.5458, -6.8725],
                    }

                    const labelFeatures = regions.map(r => ({
                        type: 'Feature',
                        properties: {
                            LABEL_TEXT: `${r.total} Alpro Stores`
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: LABEL_COORDS[r.name.toUpperCase()] || [106.8229, -6.1944]
                        }
                    }))

                    localMap.addSource('jabodetabek-points', {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: labelFeatures
                        }
                    })

                    // Add hardware-accelerated text badges directly centered on the singular Points
                    localMap.addLayer({
                        id: 'jabodetabek-labels',
                        type: 'symbol',
                        source: 'jabodetabek-points',
                        layout: {
                            'text-field': ['get', 'LABEL_TEXT'],
                            'text-size': 14,
                            'text-anchor': 'center'
                        },
                        paint: {
                            'text-color': '#18181b',
                            'text-halo-color': 'rgba(255,255,255,0.7)',
                            'text-halo-width': 3
                        }
                    })

                    let activePopup: any = null;

                    localMap.on('click', 'jabodetabek-fill', (e: any) => {
                        const regionName = e.features[0].properties.KAB_KOTA
                        const r = regions.find(x => x.name.toUpperCase() === regionName)

                        if (activePopup) activePopup.remove();

                        if (!r) {
                            activePopup = new tt.Popup({ offset: 15 }).setLngLat(e.lngLat)
                                .setHTML(`<div class="p-2 font-bold">${regionName} (No Data)</div>`).addTo(localMap);
                            return;
                        }

                        const popupHTML = `
                            <div class="px-3 py-2 font-sans text-sm min-w-[200px] text-zinc-800">
                                <div class="font-bold border-b border-zinc-200 pb-2 mb-2 text-zinc-900 text-base">${r.name}</div>
                                <div class="flex justify-between items-center text-emerald-600 mb-1 font-medium cursor-pointer hover:bg-emerald-50 px-1 py-0.5 rounded transition-colors" onclick="window.showRegionStores('${r.name}', 'Normal')"><span>Normal:</span> <span>${r.normal}</span></div>
                                <div class="flex items-center justify-between text-teal-600 mb-1 font-medium cursor-pointer hover:bg-teal-50 px-1 py-0.5 rounded transition-colors" onclick="window.showRegionStores('${r.name}', 'Repaired')"><span>Repaired:</span> <span>${r.repaired}</span></div>
                                <div class="flex items-center justify-between text-amber-600 mb-1 font-medium cursor-pointer hover:bg-amber-50 px-1 py-0.5 rounded transition-colors" onclick="window.showRegionStores('${r.name}', 'Warning')"><span>Warning:</span> <span>${r.warning}</span></div>
                                <div class="flex items-center justify-between text-rose-600 mb-1 font-medium cursor-pointer hover:bg-rose-50 px-1 py-0.5 rounded transition-colors" onclick="window.showRegionStores('${r.name}', 'Disconnected')"><span>Disconnect:</span> <span>${r.disconnected}</span></div>
                                <div class="flex items-center justify-between text-blue-600 mt-2 border-t border-zinc-200 pt-2 font-medium cursor-pointer hover:bg-blue-50 px-1 py-0.5 rounded transition-colors" onclick="window.showRegionStores('${r.name}', 'Maintenance')"><span>Maintenance:</span> <span>${r.maintenance}</span></div>
                            </div>
                        `
                        activePopup = new tt.Popup({ offset: 15 }).setLngLat(e.lngLat).setHTML(popupHTML).addTo(localMap);
                    })

                    localMap.on('mouseenter', 'jabodetabek-fill', () => {
                        localMap.getCanvas().style.cursor = 'pointer'
                    })
                    localMap.on('mouseleave', 'jabodetabek-fill', () => {
                        localMap.getCanvas().style.cursor = ''
                    })
                } catch (e: any) {
                    setErrorMsg("Failed generating realtime labels: " + e.message)
                }
            })

        } catch (err: any) {
            console.error("TomTom map initialization failed", err)
            setErrorMsg(err.message || String(err))
        }

        return () => {
            if (localMap) localMap.remove()
        }
    }, [regions, sdkLoaded])

    return (
        <div className="relative w-full h-[650px] border border-border/50 rounded-xl overflow-hidden shadow-sm bg-muted/20">
            <link rel="stylesheet" type="text/css" href="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css" />

            {errorMsg ? (
                <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center p-8 bg-rose-500/10 z-20 text-rose-600 font-medium text-center shadow-inner">
                    <span className="font-bold text-lg">Gagal memuat peta</span>
                    <span className="text-sm bg-background p-2 rounded border border-rose-200">{errorMsg}</span>
                    <span className="text-xs text-rose-400 mt-2">Debug Trace: {debugState}</span>
                </div>
            ) : (
                <div className={`absolute inset-0 flex flex-col gap-3 items-center justify-center z-0 text-muted-foreground transition-opacity duration-1000 ${sdkLoaded && mapInstance.current ? 'opacity-0 pointer-events-none' : 'animate-pulse'}`}>
                    <span className="font-semibold text-lg">Loading Interactive Map via TomTom...</span>
                    <span className="text-xs bg-muted p-2 tracking-wider rounded-md font-mono text-zinc-500">{debugState}</span>
                </div>
            )}

            <div ref={mapElement} className="absolute inset-0 z-10 pointers-events-none pointer-events-auto" style={{ minHeight: "100%", width: "100%" }} />

            <style jsx global>{`
                /* Override TomTom Popup defaults to fit Shadcn theme */
                .mapboxgl-popup-content, .tt-popup-content {
                    padding: 0 !important;
                    border-radius: 6px !important;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
                }
                .mapboxgl-popup-close-button, .tt-popup-close-button {
                    font-size: 1.25rem;
                    color: #52525b;
                    padding: 2px 6px;
                }
                .mapboxgl-popup-close-button:hover, .tt-popup-close-button:hover {
                    background-color: #f4f4f5;
                }
            `}</style>

            {/* Store Drilldown Dialog */}
            <Dialog open={!!drilldownData} onOpenChange={() => setDrilldownData(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex justify-between items-center pr-4">
                            <span>{drilldownData?.region}</span>
                            {drilldownData?.status && (
                                <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider ${drilldownData.status === 'Normal' ? 'bg-emerald-100 text-emerald-700' :
                                    drilldownData.status === 'Warning' ? 'bg-amber-100 text-amber-700' :
                                        drilldownData.status === 'Disconnected' ? 'bg-rose-100 text-rose-700' :
                                            drilldownData.status === 'Repaired' ? 'bg-teal-100 text-teal-700' :
                                                'bg-blue-100 text-blue-700'
                                    }`}>
                                    {drilldownData.status}
                                </span>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="text-sm text-muted-foreground mb-4 font-medium">
                            Total {drilldownData?.status} Stores: <b className="text-foreground">{drilldownData?.stores?.length || 0}</b>
                        </div>

                        <div className="max-h-[250px] overflow-y-auto w-full rounded-md border bg-muted/30 p-4">
                            {(!drilldownData?.stores || drilldownData.stores.length === 0) ? (
                                <div className="text-sm italic text-muted-foreground text-center py-8">
                                    No stores currently in this status.
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {drilldownData.stores.map((store, i) => (
                                        <li key={i} className="text-sm font-medium p-2 bg-background border rounded shadow-sm hover:border-blue-200 transition-colors">
                                            {store}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
