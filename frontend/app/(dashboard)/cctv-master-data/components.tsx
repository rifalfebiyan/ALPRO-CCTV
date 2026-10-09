"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2 } from "lucide-react"
import { addCctvData, editCctvData, deleteCctvData } from "./actions"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AddDataDialog({ customColumns, deletedStandardCols }: { customColumns?: any[], deletedStandardCols?: string[] }) {
    const isDeleted = (id: string) => deletedStandardCols ? deletedStandardCols.includes(id) : false;
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [urgency, setUrgency] = useState("")

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const form = e.target.form;
        if (!form) return;
        const s = (form.elements.namedItem('shrinkage') as HTMLInputElement)?.checked ? 35 : 0;
        const a = (form.elements.namedItem('alarm') as HTMLInputElement)?.checked ? 30 : 0;
        const o = (form.elements.namedItem('onsite_damage') as HTMLInputElement)?.checked ? 32.5 : 0;
        const n = (form.elements.namedItem('non_tech_damage') as HTMLInputElement)?.checked ? 2.5 : 0;

        const total = s + a + o + n;
        if (total > 0) {
            setUrgency(total + "%")
        } else {
            setUrgency("")
        }
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            await addCctvData(formData)
            setOpen(false)
        } catch (e: any) {
            alert(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button className="gap-2 h-8 text-xs" />}>
                <Plus size={16} /> Add Data
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add CCTV Master Data</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Outlet Name</Label>
                                <Input name="outlet_name" required />
                            </div>
                            {!isDeleted('pic') && (
                                <div className="space-y-2">
                                    <Label>PIC</Label>
                                    <Input name="pic" />
                                </div>
                            )}
                            {!isDeleted('sn') && (
                                <div className="space-y-2">
                                    <Label>Serial Number</Label>
                                    <Input name="serial_number" />
                                </div>
                            )}
                            {!isDeleted('urgency') && (
                                <div className="space-y-2">
                                    <Label>Urgency Point</Label>
                                    <Input name="urgency_point" placeholder="e.g. 80%" value={urgency} onChange={e => setUrgency(e.target.value)} />
                                </div>
                            )}
                            {!isDeleted('region') && (
                                <div className="space-y-2">
                                    <Label>Region</Label>
                                    <Input name="region" />
                                </div>
                            )}
                            {!isDeleted('date') && (
                                <div className="space-y-2">
                                    <Label>Check Date</Label>
                                    <Input name="check_date" placeholder="DD/MM/YYYY" />
                                </div>
                            )}
                            {!isDeleted('warranty') && (
                                <div className="space-y-2">
                                    <Label>Warranty Status</Label>
                                    <Input name="warranty_status" />
                                </div>
                            )}
                            {!isDeleted('distance') && (
                                <div className="space-y-2">
                                    <Label>Distance to HO</Label>
                                    <Input name="distance_to_ho" />
                                </div>
                            )}

                            <div className="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                                {!isDeleted('shrinkage') && (
                                    <label className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors">
                                        <input type="checkbox" name="shrinkage" onChange={handleCheckboxChange} className="accent-primary w-4 h-4 shrink-0" />
                                        <span className="text-sm font-medium leading-tight">Shrinkage</span>
                                    </label>
                                )}
                                {!isDeleted('alarm') && (
                                    <label className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors">
                                        <input type="checkbox" name="alarm" onChange={handleCheckboxChange} className="accent-primary w-4 h-4 shrink-0" />
                                        <span className="text-sm font-medium leading-tight">Alarm</span>
                                    </label>
                                )}
                                {!isDeleted('onsite') && (
                                    <label className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors">
                                        <input type="checkbox" name="onsite_damage" onChange={handleCheckboxChange} className="accent-primary w-4 h-4 shrink-0" />
                                        <span className="text-sm font-medium leading-tight">Onsite</span>
                                    </label>
                                )}
                                {!isDeleted('nontech') && (
                                    <label className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors">
                                        <input type="checkbox" name="non_tech_damage" onChange={handleCheckboxChange} className="accent-primary w-4 h-4 shrink-0" />
                                        <span className="text-sm font-medium leading-tight">Non-Tech</span>
                                    </label>
                                )}
                            </div>

                            {!isDeleted('prob_channel') && (
                                <div className="space-y-2">
                                    <Label>Problem Channel</Label>
                                    <Input name="problem_channel" />
                                </div>
                            )}
                            {!isDeleted('device') && (
                                <div className="space-y-2">
                                    <Label>Device to Replace</Label>
                                    <Input name="device_to_replace" />
                                </div>
                            )}
                            {!isDeleted('qty') && (
                                <div className="space-y-2">
                                    <Label>Device Qty</Label>
                                    <Input name="device_qty" type="number" defaultValue="0" />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select name="status" defaultValue="Normal">
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Normal">Normal</SelectItem>
                                        <SelectItem value="Disconnected">Disconnected</SelectItem>
                                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                                        <SelectItem value="Repaired">Repaired</SelectItem>
                                        <SelectItem value="Warning">Warning</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {!isDeleted('prob_detail') && (
                                <div className="space-y-2 col-span-2">
                                    <Label>Problem Detail</Label>
                                    <Input name="problem_detail" />
                                </div>
                            )}
                            {!isDeleted('result') && (
                                <div className="space-y-2 col-span-2">
                                    <Label>Result / Note</Label>
                                    <Input name="result" />
                                </div>
                            )}
                            {customColumns && customColumns.length > 0 && customColumns.map(col => (
                                <div key={col.id} className="space-y-2">
                                    <Label>{col.column_label}</Label>
                                    <Input name={`custom_${col.column_key}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline" />}>
                            Cancel
                        </DialogClose>
                        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function EditDataDialog({ data, open, setOpen, customColumns, deletedStandardCols }: { data: any, open: boolean, setOpen: (o: boolean) => void, customColumns?: any[], deletedStandardCols?: string[] }) {
    const isDeleted = (id: string) => deletedStandardCols ? deletedStandardCols.includes(id) : false;
    const [loading, setLoading] = useState(false)
    const [urgency, setUrgency] = useState(data?.urgency_point || "")

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const form = e.target.form;
        if (!form) return;
        const s = (form.elements.namedItem('shrinkage') as HTMLInputElement)?.checked ? 35 : 0;
        const a = (form.elements.namedItem('alarm') as HTMLInputElement)?.checked ? 30 : 0;
        const o = (form.elements.namedItem('onsite_damage') as HTMLInputElement)?.checked ? 32.5 : 0;
        const n = (form.elements.namedItem('non_tech_damage') as HTMLInputElement)?.checked ? 2.5 : 0;

        const total = s + a + o + n;
        if (total > 0) {
            setUrgency(total + "%")
        } else {
            setUrgency("")
        }
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            await editCctvData(data.id, formData)
            setOpen(false)
        } catch (e: any) {
            alert(e.message)
        } finally {
            setLoading(false)
        }
    }

    if (!data) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Data</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Outlet Name</Label>
                                <Input name="outlet_name" defaultValue={data.outlet_name} required />
                            </div>
                            {!isDeleted('pic') && (
                                <div className="space-y-2">
                                    <Label>PIC</Label>
                                    <Input name="pic" defaultValue={data.pic} />
                                </div>
                            )}
                            {!isDeleted('sn') && (
                                <div className="space-y-2">
                                    <Label>Serial Number</Label>
                                    <Input name="serial_number" defaultValue={data.serial_number} />
                                </div>
                            )}
                            {!isDeleted('urgency') && (
                                <div className="space-y-2">
                                    <Label>Urgency Point</Label>
                                    <Input name="urgency_point" value={urgency} onChange={e => setUrgency(e.target.value)} />
                                </div>
                            )}
                            {!isDeleted('region') && (
                                <div className="space-y-2">
                                    <Label>Region</Label>
                                    <Input name="region" defaultValue={data.region} />
                                </div>
                            )}
                            {!isDeleted('date') && (
                                <div className="space-y-2">
                                    <Label>Check Date</Label>
                                    <Input name="check_date" defaultValue={data.check_date} />
                                </div>
                            )}
                            {!isDeleted('warranty') && (
                                <div className="space-y-2">
                                    <Label>Warranty Status</Label>
                                    <Input name="warranty_status" defaultValue={data.warranty_status} />
                                </div>
                            )}
                            {!isDeleted('distance') && (
                                <div className="space-y-2">
                                    <Label>Distance to HO</Label>
                                    <Input name="distance_to_ho" defaultValue={data.distance_to_ho} />
                                </div>
                            )}

                            <div className="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                                {!isDeleted('shrinkage') && (
                                    <label className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors">
                                        <input type="checkbox" name="shrinkage" defaultChecked={data.shrinkage} onChange={handleCheckboxChange} className="accent-primary w-4 h-4 shrink-0" />
                                        <span className="text-sm font-medium leading-tight">Shrinkage</span>
                                    </label>
                                )}
                                {!isDeleted('alarm') && (
                                    <label className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors">
                                        <input type="checkbox" name="alarm" defaultChecked={data.alarm} onChange={handleCheckboxChange} className="accent-primary w-4 h-4 shrink-0" />
                                        <span className="text-sm font-medium leading-tight">Alarm</span>
                                    </label>
                                )}
                                {!isDeleted('onsite') && (
                                    <label className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors">
                                        <input type="checkbox" name="onsite_damage" defaultChecked={data.onsite_damage} onChange={handleCheckboxChange} className="accent-primary w-4 h-4 shrink-0" />
                                        <span className="text-sm font-medium leading-tight">Onsite</span>
                                    </label>
                                )}
                                {!isDeleted('nontech') && (
                                    <label className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors">
                                        <input type="checkbox" name="non_tech_damage" defaultChecked={data.non_tech_damage} onChange={handleCheckboxChange} className="accent-primary w-4 h-4 shrink-0" />
                                        <span className="text-sm font-medium leading-tight">Non-Tech</span>
                                    </label>
                                )}
                            </div>

                            {!isDeleted('prob_channel') && (
                                <div className="space-y-2">
                                    <Label>Problem Channel</Label>
                                    <Input name="problem_channel" defaultValue={data.problem_channel} />
                                </div>
                            )}
                            {!isDeleted('device') && (
                                <div className="space-y-2">
                                    <Label>Device to Replace</Label>
                                    <Input name="device_to_replace" defaultValue={data.device_to_replace} />
                                </div>
                            )}
                            {!isDeleted('qty') && (
                                <div className="space-y-2">
                                    <Label>Device Qty</Label>
                                    <Input name="device_qty" type="number" defaultValue={data.device_qty} />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select name="status" defaultValue={data.status || "Normal"}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Normal">Normal</SelectItem>
                                        <SelectItem value="Disconnected">Disconnected</SelectItem>
                                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                                        <SelectItem value="Repaired">Repaired</SelectItem>
                                        <SelectItem value="Warning">Warning</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {!isDeleted('prob_detail') && (
                                <div className="space-y-2 col-span-2">
                                    <Label>Problem Detail</Label>
                                    <Input name="problem_detail" defaultValue={data.problem_detail} />
                                </div>
                            )}
                            {!isDeleted('result') && (
                                <div className="space-y-2 col-span-2">
                                    <Label>Result / Note</Label>
                                    <Input name="result" defaultValue={data.result} />
                                </div>
                            )}
                            {customColumns && customColumns.length > 0 && customColumns.map(col => (
                                <div key={col.id} className="space-y-2">
                                    <Label>{col.column_label}</Label>
                                    <Input name={`custom_${col.column_key}`} defaultValue={data.dynamic_fields?.[col.column_key] || ""} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline" />}>
                            Cancel
                        </DialogClose>
                        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function DeleteDataDialog({ id, open, setOpen }: { id: string | null, open: boolean, setOpen: (o: boolean) => void }) {
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        if (!id) return;
        setLoading(true)
        try {
            await deleteCctvData(id)
            setOpen(false)
        } catch (e: any) {
            alert(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Data</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    Are you sure you want to delete this data? This action cannot be undone.
                </div>
                <DialogFooter>
                    <DialogClose render={<Button variant="outline" disabled={loading} />}>
                        Cancel
                    </DialogClose>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>{loading ? "Deleting..." : "Delete"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
