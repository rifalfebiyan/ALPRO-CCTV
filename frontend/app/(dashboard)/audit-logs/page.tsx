import { createClient } from "@/lib/server"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export const metadata = {
    title: "System Audit Logs | ALPRO CCTV",
    description: "Audit trail for system mutations",
}

function formatAction(action: string) {
    if (action === "ADD") return <span className="bg-emerald-500/15 text-emerald-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">ADD</span>
    if (action === "EDIT") return <span className="bg-blue-500/15 text-blue-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">EDIT</span>
    if (action === "DELETE") return <span className="bg-rose-500/15 text-rose-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">DELETE</span>
    return <span className="bg-slate-500/15 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{action}</span>
}

export default async function AuditLogsPage() {
    const supabase = await createClient();

    // Fetch logs (top 150)
    const { data: logs, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(150);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-6">
                <h2 className="text-3xl font-bold tracking-tight">System Audit Logs</h2>
            </div>

            <div className="rounded-xl border border-border/60 bg-card shadow-md w-full overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted sticky top-0 z-30 shadow-sm">
                        <TableRow className="hover:bg-transparent border-b-0">
                            <TableHead className="whitespace-nowrap font-semibold">Timestamp</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Actor</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold text-center">Action</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Target Table</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Changes / Payload</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs && logs.length > 0 ? logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap text-sm text-muted-foreground w-48">
                                    {new Intl.DateTimeFormat('id-ID', {
                                        dateStyle: 'medium',
                                        timeStyle: 'medium'
                                    }).format(new Date(log.created_at))}
                                </TableCell>
                                <TableCell className="whitespace-nowrap font-medium w-48">
                                    {log.actor_name}
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-center w-32">
                                    {formatAction(log.action_type)}
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-sm w-48">
                                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{log.target_table}</code>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {log.action_type === "ADD" && log.new_data && (
                                        <div className="text-xs text-muted-foreground max-w-xl truncate" title={JSON.stringify(log.new_data)}>
                                            <span className="font-semibold text-emerald-500">Inserted:</span> {log.new_data.outlet_name || log.new_data.column_label || log.target_id}
                                        </div>
                                    )}
                                    {log.action_type === "DELETE" && log.old_data && (
                                        <div className="text-xs text-muted-foreground max-w-xl truncate" title={JSON.stringify(log.old_data)}>
                                            <span className="font-semibold text-rose-500">Removed:</span> {log.old_data.outlet_name || log.old_data.column_label || log.target_id}
                                        </div>
                                    )}
                                    {log.action_type === "EDIT" && log.old_data && log.new_data && (
                                        <div className="text-xs max-w-xl">
                                            <span className="font-semibold text-blue-500 mr-2">Modified:</span>
                                            <span className="text-muted-foreground">
                                                {log.new_data.outlet_name || log.target_id}
                                            </span>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    {error ? `Error loading logs: ${error.message}` : "No audit logs found. Perform actions on CCTV Data to generate logs."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
