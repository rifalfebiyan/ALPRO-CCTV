import { createClient } from "@/lib/server"
import { MapWrapper } from "./map-wrapper"

export default async function MapDashboardPage() {
    const supabase = await createClient()
    const { data: rows, error } = await supabase.from('cctv_master_data').select('region, status, outlet_name')

    if (error) {
        return <div className="p-8 text-destructive">Error loading map regions: {error.message}</div>
    }

    // Fuzzy matching to map wild DB inputs to precise GeoJSON polygons
    const getCanonicalRegion = (raw: string): string => {
        const s = raw.toUpperCase().replace(/[^A-Z]/g, ' ')
        if (s.includes("JAKARTA SELATAN") || s.includes("JAKSEL")) return "KOTA JAKARTA SELATAN"
        if (s.includes("JAKARTA TIMUR") || s.includes("JAKTIM")) return "KOTA JAKARTA TIMUR"
        if (s.includes("JAKARTA BARAT") || s.includes("JAKBAR")) return "KOTA JAKARTA BARAT"
        if (s.includes("JAKARTA UTARA") || s.includes("JAKUT")) return "KOTA JAKARTA UTARA"
        if (s.includes("JAKARTA PUSAT") || s.includes("JAKPUS")) return "KOTA JAKARTA PUSAT"
        if (s.includes("TANGERANG SELATAN") || s.includes("TANGSEL")) return "KOTA TANGERANG SELATAN"
        if (s.includes("KABUPATEN TANGERANG") || s.includes("KAB TANGERANG")) return "KABUPATEN TANGERANG"
        if (s.includes("TANGERANG")) return "KOTA TANGERANG"
        if (s.includes("KABUPATEN BEKASI") || s.includes("KAB BEKASI")) return "KABUPATEN BEKASI"
        if (s.includes("BEKASI")) return "KOTA BEKASI"
        if (s.includes("KABUPATEN BOGOR") || s.includes("KAB BOGOR")) return "KABUPATEN BOGOR"
        if (s.includes("BOGOR")) return "KOTA BOGOR"
        if (s.includes("DEPOK")) return "KOTA DEPOK"
        if (s.includes("BANDUNG")) return "KOTA BANDUNG"
        if (s.includes("CIMAHI")) return "KOTA CIMAHI"
        return raw.toUpperCase()
    }

    // Grouping
    const regionsMap: Record<string, any> = {}

    rows.forEach(row => {
        const rName = getCanonicalRegion(row.region || "UNKNOWN REGION")
        const outletName = row.outlet_name || "Unknown Store"

        if (!regionsMap[rName]) {
            regionsMap[rName] = {
                name: rName,
                total: 0,
                normal: 0,
                warning: 0,
                disconnected: 0,
                maintenance: 0,
                repaired: 0,
                normalStores: [],
                warningStores: [],
                disconnectedStores: [],
                maintenanceStores: [],
                repairedStores: []
            }
        }

        regionsMap[rName].total++;

        switch (row.status) {
            case "Normal":
                regionsMap[rName].normal++;
                regionsMap[rName].normalStores.push(outletName);
                break;
            case "Warning":
                regionsMap[rName].warning++;
                regionsMap[rName].warningStores.push(outletName);
                break;
            case "Disconnected":
                regionsMap[rName].disconnected++;
                regionsMap[rName].disconnectedStores.push(outletName);
                break;
            case "Maintenance":
                regionsMap[rName].maintenance++;
                regionsMap[rName].maintenanceStores.push(outletName);
                break;
            case "Repaired":
                regionsMap[rName].repaired++;
                regionsMap[rName].repairedStores.push(outletName);
                break;
        }
    })

    const regions = Object.values(regionsMap).sort((a: any, b: any) => b.total - a.total)

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Alpro Indonesia Stores</h2>
            {/* <p className="text-muted-foreground mb-6">Real-time health visualization and status breakdowns grouped by physical territory.</p> */}

            <MapWrapper regions={regions} />
        </div>
    )
}
