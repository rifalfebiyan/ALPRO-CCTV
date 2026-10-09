"use client"
import { useState, useRef, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Download, Upload, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"
import { bulkImportCctvData } from "./actions"

export function ImportExportControls({ rows, customColumns }: { rows: any[], customColumns: any[] }) {
    const fileRef = useRef<HTMLInputElement>(null)
    const [isPending, startTransition] = useTransition()

    function handleExport() {
        if (!rows || rows.length === 0) return alert("No data to export.")

        // Map data to flat structure
        const flattened = rows.map(r => {
            const flatObj: any = {
                "ID": r.id,
                "Outlet Name": r.outlet_name,
                "PIC": r.pic,
                "Serial Number": r.serial_number,
                "Urgency Point": r.urgency_point,
                "Region": r.region,
                "Check Date": r.check_date,
                "Warranty": r.warranty_status,
                "Distance to HO": r.distance_to_ho,
                "Shrinkage": r.shrinkage ? "YES" : "NO",
                "Alarm": r.alarm ? "YES" : "NO",
                "Onsite Damage": r.onsite_damage ? "YES" : "NO",
                "Non-Tech Damage": r.non_tech_damage ? "YES" : "NO",
                "Problem Channel": r.problem_channel,
                "Problem Detail": r.problem_detail,
                "Device To Replace": r.device_to_replace,
                "Device Qty": r.device_qty,
                "Result": r.result,
                "Status": r.status
            }

            // Map dynamic columns
            customColumns.forEach(col => {
                flatObj[`Custom - ${col.column_label}`] = r.dynamic_fields?.[col.column_key] || ""
            })

            return flatObj
        })

        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(flattened)
        XLSX.utils.book_append_sheet(wb, ws, "CCTV_Data")
        XLSX.writeFile(wb, `CCTV_Master_Data_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                const bstr = event.target?.result
                const wb = XLSX.read(bstr, { type: "binary" })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                // Parse the data array
                const data = XLSX.utils.sheet_to_json(ws)

                if (data.length === 0) return alert("The uploaded file is empty.")

                // Send to server action
                startTransition(async () => {
                    try {
                        const result = await bulkImportCctvData(data)
                        alert(`Successfully imported/updated ${result.count} CCTV device(s).`)
                    } catch (error: any) {
                        alert("Import failed: " + error.message)
                    }
                    if (fileRef.current) fileRef.current.value = "" // reset input
                })
            } catch (err) {
                console.error(err)
                alert("Failed to parse the Excel file. Make sure it's valid.")
            }
        }
        reader.readAsBinaryString(file)
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-2" onClick={handleExport} disabled={isPending}>
                <Download size={14} /> Export Excel
            </Button>
            <Button variant="default" size="sm" className="h-8 text-xs gap-2" onClick={() => fileRef.current?.click()} disabled={isPending}>
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {isPending ? "Importing..." : "Import Data"}
            </Button>
            <input type="file" className="hidden" ref={fileRef} accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
        </div>
    )
}
