"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FilterControls, RowLimitSelector } from "./filter-controls"
import { DataPagination } from "@/components/data-pagination"
import { AddDataDialog, EditDataDialog, DeleteDataDialog } from "./components"
import { Check, Minus, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"

const getStatusColor = (status: string) => {
    switch (status) {
        case "Active": return 'bg-emerald-500/15 text-emerald-500';
        case "Disconnected": return 'bg-rose-500/15 text-rose-500';
        case "Maintenance": return 'bg-blue-500/15 text-blue-500';
        case "Repaired": return 'bg-teal-500/15 text-teal-600';
        case "Warning": return 'bg-amber-500/15 text-amber-500';
        default: return 'bg-slate-500/15 text-slate-500';
    }
}

const getRowAccent = (status: string) => {
    switch (status) {
        case "Active": return 'bg-emerald-500/5 hover:bg-emerald-500/15 border-l-[3px] border-l-emerald-500 transition-colors';
        case "Disconnected": return 'bg-rose-500/5 hover:bg-rose-500/15 border-l-[3px] border-l-rose-500 transition-colors';
        case "Maintenance": return 'bg-blue-500/5 hover:bg-blue-500/15 border-l-[3px] border-l-blue-500 transition-colors';
        case "Repaired": return 'bg-teal-500/5 hover:bg-teal-500/15 border-l-[3px] border-l-teal-500 transition-colors';
        case "Warning": return 'bg-amber-500/5 hover:bg-amber-500/15 border-l-[3px] border-l-amber-500 transition-colors';
        default: return 'even:bg-muted/30 hover:bg-muted/50 border-l-[3px] border-l-transparent transition-colors';
    }
}

export function CctvClientTable({
    rows,
    customColumns,
    deletedStandardCols,
    count,
    currentPage,
    totalPages
}: {
    rows: any[],
    customColumns: any[],
    deletedStandardCols: string[],
    count: number,
    currentPage: number,
    totalPages: number
}) {
    const [hiddenCols, setHiddenCols] = useState<string[]>([])

    const searchParams = useSearchParams()
    const router = useRouter()

    const currentSort = searchParams.get('sort') || 'id'
    const currentAsc = searchParams.get('asc') === 'true'

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("cctv_hidden_cols")
        if (saved) setHiddenCols(JSON.parse(saved))
    }, [])

    function toggleCol(colId: string) {
        const newCols = hiddenCols.includes(colId)
            ? hiddenCols.filter(c => c !== colId)
            : [...hiddenCols, colId]
        setHiddenCols(newCols)
        localStorage.setItem("cctv_hidden_cols", JSON.stringify(newCols))
    }

    const isVisible = (colId: string) => !hiddenCols.includes(colId) && !deletedStandardCols.includes(colId)

    const handleSort = (col: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (currentSort === col) {
            params.set('asc', currentAsc ? 'false' : 'true')
        } else {
            params.set('sort', col)
            params.set('asc', 'true')
        }
        router.push(`?${params.toString()}`)
    }

    const SortableHead = ({ id, label, dbCol = id, className = "" }: { id: string, label: string, dbCol?: string, className?: string }) => {
        if (!isVisible(id)) return null;
        return (
            <TableHead
                className={`whitespace-nowrap font-semibold cursor-pointer hover:bg-muted/10 transition-colors ${className}`}
                onClick={() => handleSort(dbCol)}
            >
                <div className={`flex items-center gap-1 ${className.includes('text-center') ? 'justify-center' : ''}`}>
                    {label}
                    {currentSort === dbCol ? (currentAsc ? <ArrowUp size={14} className="text-primary" /> : <ArrowDown size={14} className="text-primary" />) : <ArrowUpDown size={14} className="opacity-30" />}
                </div>
            </TableHead>
        )
    }

    return (
        <div className="space-y-4">
            <FilterControls
                customColumns={customColumns}
                deletedStandardCols={deletedStandardCols}
                hiddenCols={hiddenCols}
                toggleCol={toggleCol}
            />

            <div className="rounded-xl border border-border/60 bg-card shadow-md w-full overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted sticky top-0 z-30 shadow-sm">
                        <TableRow className="hover:bg-transparent border-b-0">
                            <SortableHead id="outlet" label="Outlet" dbCol="outlet_name" />
                            <SortableHead id="pic" label="PIC" />
                            <SortableHead id="sn" label="SN" dbCol="serial_number" />
                            <SortableHead id="urgency" label="Urgency Point" dbCol="urgency_point" />
                            <SortableHead id="region" label="Region" />
                            <SortableHead id="date" label="Check Date" dbCol="check_date" />
                            <SortableHead id="warranty" label="Warranty" dbCol="warranty_status" />
                            <SortableHead id="distance" label="Distance to HO" dbCol="distance_to_ho" />

                            <SortableHead id="shrinkage" label="Shrinkage" className="text-center" />
                            <SortableHead id="alarm" label="Alarm" className="text-center" />
                            <SortableHead id="onsite" label="Onsite Damage" dbCol="onsite_damage" className="text-center" />
                            <SortableHead id="nontech" label="Non-Tech Damage" dbCol="non_tech_damage" className="text-center" />

                            <SortableHead id="prob_channel" label="Problem Ch" dbCol="problem_channel" />
                            <SortableHead id="prob_detail" label="Problem Detail" dbCol="problem_detail" />
                            <SortableHead id="device" label="Device Replace" dbCol="device_to_replace" />
                            <SortableHead id="qty" label="Device Qty" dbCol="device_qty" />
                            <SortableHead id="result" label="Result" />

                            {customColumns.map((col: any) => isVisible("custom_" + col.column_key) && (
                                <TableHead key={col.id} className="whitespace-nowrap font-semibold text-primary">{col.column_label}</TableHead>
                            ))}

                            {isVisible("status") && <TableHead className="whitespace-nowrap font-semibold text-center">Status</TableHead>}
                            <TableHead className="whitespace-nowrap font-semibold text-right border-l sticky right-0 bg-card z-20 shadow-[-12px_0_15px_-5px_rgba(0,0,0,0.05)]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows && rows.length > 0 ? rows.map((row) => (
                            <TableRow key={row.id} className={getRowAccent(row.status)}>
                                {isVisible("outlet") && <TableCell className="font-medium whitespace-nowrap">{row.outlet_name}</TableCell>}
                                {isVisible("pic") && <TableCell className="whitespace-nowrap">{row.pic}</TableCell>}
                                {isVisible("sn") && <TableCell className="whitespace-nowrap text-muted-foreground">{row.serial_number}</TableCell>}
                                {isVisible("urgency") && <TableCell className="whitespace-nowrap">{row.urgency_point}</TableCell>}
                                {isVisible("region") && <TableCell className="whitespace-nowrap">{row.region}</TableCell>}
                                {isVisible("date") && <TableCell className="whitespace-nowrap">{row.check_date}</TableCell>}
                                {isVisible("warranty") && <TableCell className="whitespace-nowrap">{row.warranty_status}</TableCell>}
                                {isVisible("distance") && <TableCell className="whitespace-nowrap">{row.distance_to_ho}</TableCell>}
                                {isVisible("shrinkage") && <TableCell className="whitespace-nowrap text-center">{row.shrinkage ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <Minus className="mx-auto h-4 w-4 text-muted-foreground/50" />}</TableCell>}
                                {isVisible("alarm") && <TableCell className="whitespace-nowrap text-center">{row.alarm ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <Minus className="mx-auto h-4 w-4 text-muted-foreground/50" />}</TableCell>}
                                {isVisible("onsite") && <TableCell className="whitespace-nowrap text-center">{row.onsite_damage ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <Minus className="mx-auto h-4 w-4 text-muted-foreground/50" />}</TableCell>}
                                {isVisible("nontech") && <TableCell className="whitespace-nowrap text-center">{row.non_tech_damage ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <Minus className="mx-auto h-4 w-4 text-muted-foreground/50" />}</TableCell>}
                                {isVisible("prob_channel") && <TableCell className="whitespace-nowrap">{row.problem_channel}</TableCell>}
                                {isVisible("prob_detail") && <TableCell className="whitespace-nowrap max-w-[200px] truncate" title={row.problem_detail}>{row.problem_detail}</TableCell>}
                                {isVisible("device") && <TableCell className="whitespace-nowrap">{row.device_to_replace}</TableCell>}
                                {isVisible("qty") && <TableCell className="whitespace-nowrap text-center">{row.device_qty}</TableCell>}
                                {isVisible("result") && <TableCell className="whitespace-nowrap max-w-[200px] truncate" title={row.result}>{row.result}</TableCell>}

                                {customColumns.map((col: any) => isVisible("custom_" + col.column_key) && (
                                    <TableCell key={col.id} className="whitespace-nowrap max-w-[200px] truncate" title={row.dynamic_fields?.[col.column_key] || "-"}>
                                        {row.dynamic_fields?.[col.column_key] || "-"}
                                    </TableCell>
                                ))}

                                {isVisible("status") && <TableCell className="whitespace-nowrap text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
                                        {row.status}
                                    </span>
                                </TableCell>}
                                <TableCell className="whitespace-nowrap text-right border-l sticky right-0 bg-card z-10 shadow-[-12px_0_15px_-5px_rgba(0,0,0,0.05)]">
                                    <div className="flex items-center justify-end">
                                        <EditDataDialog data={row} customColumns={customColumns} deletedStandardCols={deletedStandardCols} />
                                        <DeleteDataDialog id={row.id} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={25} className="h-24 text-center text-muted-foreground">
                                    No data found. If you just created the table, click "Add Data" to insert rows or import via CSV.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between py-4 pl-4 pr-1 gap-4">
                <div className="flex items-center gap-4 text-xs text-muted-foreground w-full sm:w-auto">
                    <span>Showing {rows?.length || 0} of {count || 0} entries</span>
                    <RowLimitSelector />
                </div>
                <DataPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    createPageUrl={(p) => `/cctv-master-data?page=${p}`}
                />
            </div>
        </div>
    )
}
