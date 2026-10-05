import { createClient } from "@/lib/server"
import { AddDataDialog } from "./components"
import { ColumnManager } from "./column-manager"
import { CctvClientTable } from "./cctv-client-table"

export default async function CctvMasterDataPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = props.searchParams ? await props.searchParams : undefined

    const page = parseInt((searchParams?.page as string) || "1")
    const limit = searchParams?.limit === "ALL" ? 999999 : parseInt((searchParams?.limit as string) || "10")

    // Calculate range
    const from = (page - 1) * limit
    const to = from + limit - 1

    const supabase = await createClient()

    const { data: colsMeta } = await supabase.from("cctv_custom_columns").select("*").order("created_at", { ascending: true })
    const deletedStandardCols = colsMeta?.filter(c => c.column_label === 'DELETED_STANDARD').map(c => c.column_key) || []
    const customColumns = colsMeta?.filter(c => c.column_label !== 'DELETED_STANDARD') || []

    let query = supabase.from("cctv_master_data").select("*", { count: "exact" })

    // Apply search filter
    if (searchParams?.search) {
        const term = searchParams.search as string
        query = query.or(`outlet_name.ilike.%${term}%,pic.ilike.%${term}%,serial_number.ilike.%${term}%`)
    }

    // Apply status filter
    if (searchParams?.status && searchParams.status !== "ALL") {
        query = query.eq("status", searchParams.status as string)
    }

    // Apply region filter
    if (searchParams?.region && searchParams.region !== "ALL") {
        query = query.eq("region", searchParams.region as string)
    }

    // Apply sorting
    const sortCol = (searchParams?.sort as string) || "id"
    const sortAsc = searchParams?.asc === "true"

    // Always sort by requested column (oldest first initially, or user defined)
    query = query.order(sortCol, { ascending: sortAsc })

    const { data: rows, count, error } = await query.range(from, to)
    const totalPages = Math.ceil((count || 0) / limit)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">CCTV Master Data</h2>
                <div className="flex items-center gap-2">
                    <ColumnManager customColumns={customColumns} deletedStandardCols={deletedStandardCols} />
                    <AddDataDialog customColumns={customColumns} deletedStandardCols={deletedStandardCols} />
                </div>
            </div>

            <CctvClientTable
                rows={rows || []}
                customColumns={customColumns}
                deletedStandardCols={deletedStandardCols}
                count={count || 0}
                currentPage={page}
                totalPages={totalPages}
            />
        </div>
    )
}
