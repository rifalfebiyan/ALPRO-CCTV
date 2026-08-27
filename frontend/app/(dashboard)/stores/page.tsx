import { createClient } from "@/lib/server"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MonitorPlay, Settings2, Plus } from "lucide-react"
import Link from "next/link"
import { DataPagination } from "@/components/data-pagination"

export default async function StoresRegistry(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = props.searchParams ? await props.searchParams : undefined
    const currentPage = searchParams?.page ? parseInt(searchParams.page as string, 10) : 1
    const limit = 10
    const from = (currentPage - 1) * limit
    const to = from + limit - 1

    const supabase = await createClient()

    // Mengambil daftar stores dari Supabase, beserta jumlah NVR jika ada
    const { data: stores, count, error } = await supabase
        .from('stores')
        .select(`
      id,
      store_code,
      name,
      region,
      status,
      nvrs (
        model
      )
    `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    const totalPages = count ? Math.ceil(count / limit) : 0

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Stores Registry</h2>
                <div className="flex items-center space-x-2">
                    <Button variant="outline">Download CSV</Button>
                    <Link href="/stores/new">
                        <Button className="gap-2"><Plus size={16} /> Add Store</Button>
                    </Link>
                </div>
            </div>
            <div className="flex items-center py-4 gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search stores..."
                        className="pl-8"
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Settings2 className="h-4 w-4" />
                    More Filters
                </Button>
            </div>
            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Store Code</TableHead>
                            <TableHead>Store Name</TableHead>
                            <TableHead>Region</TableHead>
                            <TableHead>NVR / DVR Model</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stores && stores.length > 0 ? (
                            stores.map((store: any) => (
                                <TableRow key={store.id}>
                                    <TableCell className="font-medium">{store.store_code}</TableCell>
                                    <TableCell>{store.name}</TableCell>
                                    <TableCell>{store.region}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {store.nvrs && store.nvrs.length > 0 ? store.nvrs[0].model : 'No NVR/DVR'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={store.status === 'Online' ? 'default' : store.status === 'Warning' ? 'secondary' : 'destructive'}
                                            className={store.status === 'Online' ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20' :
                                                store.status === 'Warning' ? 'bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border-amber-500/20' : ''}>
                                            {store.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/stores/${store.id}`}>
                                            <Button variant="secondary" size="sm" className="gap-2">
                                                <MonitorPlay className="w-4 h-4" />
                                                View CCTV
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    Tidak ada data toko. Silakan tambahkan toko dan CCTVs.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between py-4 pl-4 pr-1">
                <div className="text-xs text-muted-foreground">
                    Showing {stores?.length || 0} of {count || 0} entries
                </div>
                <DataPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    createPageUrl={(p) => `/stores?page=${p}`}
                />
            </div>
        </div>
    )
}
