"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Plus, Edit, Trash2 } from "lucide-react"
import { addCustomColumn, editCustomColumn, deleteCustomColumn, deleteStandardColumn } from "./actions"
import { AVAILABLE_COLUMNS } from "./filter-controls"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"

export function ColumnManager({ customColumns, deletedStandardCols }: { customColumns: any[], deletedStandardCols: string[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [newCol, setNewCol] = useState("")

    async function handleAdd() {
        if (!newCol.trim()) return;
        setLoading(true)
        try {
            await addCustomColumn(newCol.trim())
            setNewCol("")
        } catch (e: any) {
            alert(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure? Existing data for this column will become unreachable.")) return;
        setLoading(true)
        try {
            await deleteCustomColumn(id)
        } catch (e: any) {
            alert(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleDeleteStandard(id: string) {
        if (!confirm("Are you sure you want to delete this standard column? The UI will completely hide it.")) return;
        setLoading(true)
        try {
            await deleteStandardColumn(id)
        } catch (e: any) {
            alert(e.message)
        } finally {
            setLoading(false)
        }
    }

    const activeStandardCols = AVAILABLE_COLUMNS.filter(c => !deletedStandardCols.includes(c.id) && !['outlet', 'status'].includes(c.id))

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" className="gap-2 h-8 text-xs" />}>
                <Settings size={16} /> Edit Table Schema
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage Table Columns</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Stored Custom Columns & Default Fields</Label>
                        {(customColumns && customColumns.length > 0) || activeStandardCols.length > 0 ? (
                            <div className="flex flex-col gap-1.5 rounded-md border p-2 bg-muted/20 max-h-[50vh] overflow-y-auto scrollbar-thin">
                                {activeStandardCols.map(col => (
                                    <div key={col.id} className="flex items-center justify-between py-1.5 px-3 text-sm border rounded-sm bg-background shadow-sm">
                                        <span>{col.label} <span className="text-[10px] uppercase font-medium text-blue-500 ml-2">Default</span></span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteStandard(col.id)} disabled={loading}>
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                ))}
                                {customColumns.map(c => (
                                    <div key={c.id} className="flex items-center justify-between py-1.5 px-3 text-sm border rounded-sm bg-background shadow-sm">
                                        <span>{c.column_label} <span className="text-[10px] uppercase font-medium text-emerald-500 ml-2">Custom</span></span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(c.id)} disabled={loading}>
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-6 border rounded-md border-dashed">
                                No columns to manage.
                            </div>
                        )}
                    </div>
                    <div className="space-y-2 border-t pt-4">
                        <Label>Add New Column</Label>
                        <div className="flex items-center gap-2">
                            <Input placeholder="Column Name (e.g. Installer Node)" value={newCol} onChange={e => setNewCol(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }} />
                            <Button onClick={handleAdd} disabled={!newCol.trim() || loading} type="button">
                                <Plus size={16} /> Add
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>
                        Done
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
