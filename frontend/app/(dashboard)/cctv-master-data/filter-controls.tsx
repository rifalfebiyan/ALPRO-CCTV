"use client"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState, useRef } from "react"

export const AVAILABLE_COLUMNS = [
    { id: "outlet", label: "Outlet" },
    { id: "pic", label: "PIC" },
    { id: "sn", label: "SN" },
    { id: "urgency", label: "Urgency Point" },
    { id: "region", label: "Region" },
    { id: "date", label: "Check Date" },
    { id: "warranty", label: "Warranty" },
    { id: "distance", label: "Distance to HO" },
    { id: "shrinkage", label: "Shrinkage" },
    { id: "alarm", label: "Alarm" },
    { id: "onsite", label: "Onsite Damage" },
    { id: "nontech", label: "Non-Tech Damage" },
    { id: "prob_channel", label: "Problem Ch" },
    { id: "prob_detail", label: "Problem Detail" },
    { id: "device", label: "Device Replace" },
    { id: "qty", label: "Device Qty" },
    { id: "result", label: "Result" },
    { id: "status", label: "Status" },
]

export function FilterControls({
    customColumns,
    deletedStandardCols,
    hiddenCols,
    toggleCol
}: {
    customColumns?: any[],
    deletedStandardCols: string[],
    hiddenCols: string[],
    toggleCol: (id: string) => void
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const activeStandardCols = AVAILABLE_COLUMNS.filter(c => !deletedStandardCols.includes(c.id))

    const combinedColumns = [
        ...activeStandardCols,
        ...(customColumns || []).map(cc => ({
            id: "custom_" + cc.column_key,
            label: cc.column_label
        }))
    ];

    const status = searchParams.get("status") || "ALL"
    const region = searchParams.get("region") || "ALL"

    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")

    function handleSearch(term: string) {
        setSearchTerm(term)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (term) {
                params.set("search", term)
            } else {
                params.delete("search")
            }
            params.delete("page")
            router.push(`${pathname}?${params.toString()}`)
        }, 500)
    }

    function updateParams(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "ALL") {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        // reset pagination
        params.delete("page")
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 pb-4">
            <div className="relative flex-1 max-w-sm w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search outlet, PIC, or SN..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm font-medium whitespace-nowrap">Status:</span>
                <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-32"
                    value={status}
                    onChange={(e) => updateParams("status", e.target.value)}
                >
                    <option value="ALL">All</option>
                    <option value="Active">Active</option>
                    <option value="Disconnected">Disconnected</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Warning">Warning</option>
                </select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm font-medium whitespace-nowrap">Region:</span>
                <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-48"
                    value={region}
                    onChange={(e) => updateParams("region", e.target.value)}
                >
                    <option value="ALL">All Regions</option>
                    <option value="KOTA JAKARTA TIMUR">Jakarta Timur</option>
                    <option value="KOTA JAKARTA SELATAN">Jakarta Selatan</option>
                    <option value="KOTA JAKARTA BARAT">Jakarta Barat</option>
                    <option value="KOTA JAKARTA UTARA">Jakarta Utara</option>
                    <option value="KOTA JAKARTA PUSAT">Jakarta Pusat</option>
                    <option value="KOTA BEKASI">Kota Bekasi</option>
                    <option value="KABUPATEN BEKASI">Kabupaten Bekasi</option>
                    <option value="KOTA DEPOK">Kota Depok</option>
                    <option value="KOTA BOGOR">Kota Bogor</option>
                    <option value="KABUPATEN BOGOR">Kab. Bogor</option>
                    <option value="KOTA TANGERANG">Kota Tangerang</option>
                    <option value="KOTA TANGERANG SELATAN">Tangerang Selatan</option>
                    <option value="KABUPATEN TANGERANG">Kab. Tangerang</option>
                    <option value="KOTA BANDUNG">Kota Bandung</option>
                    <option value="KOTA CIMAHI">Kota Cimahi</option>
                </select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="outline" className="h-10" />}>
                        Columns
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 max-h-96" align="end">
                        {combinedColumns.map(col => (
                            <DropdownMenuCheckboxItem
                                key={col.id}
                                checked={!hiddenCols.includes(col.id)}
                                onCheckedChange={() => toggleCol(col.id)}
                            >
                                {col.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}

export function RowLimitSelector() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const limit = searchParams.get("limit") || "10"

    function updateLimit(val: string) {
        const params = new URLSearchParams(searchParams.toString())
        params.set("limit", val)
        params.delete("page")
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">Rows per page:</span>
            <select
                className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm w-16"
                value={limit}
                onChange={(e) => updateLimit(e.target.value)}
            >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="ALL">All</option>
            </select>
        </div>
    )
}
