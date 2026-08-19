"use client"

import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AlarmActionsProps {
    storeCode: string
    storeName: string
}

async function sendCommand(command: string, store_code: string, args?: Record<string, string>) {
    const res = await fetch("/api/alarm-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, store_code, args }),
    })
    return res.json()
}

export function AlarmActions({ storeCode, storeName }: AlarmActionsProps) {
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [picDialog, setPicDialog] = useState<"add" | "edit" | "delete" | null>(null)
    const [picPhone, setPicPhone] = useState("")
    const [picIndex, setPicIndex] = useState("")

    function showFeedback(msg: string) {
        setFeedback(msg)
        setTimeout(() => setFeedback(null), 3000)
    }

    async function handleSimpleCommand(command: string) {
        setLoading(true)
        try {
            const data = await sendCommand(command, storeCode)
            showFeedback(data.success ? `/${command} terkirim` : (data.error || "Gagal"))
        } catch {
            showFeedback("Error")
        } finally {
            setLoading(false)
        }
    }

    async function handlePicSubmit() {
        setLoading(true)
        try {
            let data
            if (picDialog === "add") {
                data = await sendCommand("addpic", storeCode, { phone: picPhone })
            } else if (picDialog === "edit") {
                data = await sendCommand("editpic", storeCode, { index: picIndex, phone: picPhone })
            } else if (picDialog === "delete") {
                data = await sendCommand("delpic", storeCode, { index: picIndex })
            }
            showFeedback(data?.success ? "Terkirim" : (data?.error || "Gagal"))
        } catch {
            showFeedback("Error")
        } finally {
            setLoading(false)
            setPicDialog(null)
            setPicPhone("")
            setPicIndex("")
        }
    }

    return (
        <>
            <div className="flex items-center justify-center gap-1">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        disabled={loading}
                        className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1 rounded-sm shadow-sm border outline-none cursor-pointer transition disabled:opacity-50"
                    >
                        {loading ? "..." : "Aksi ▾"}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-xs text-muted-foreground">{storeName} ({storeCode})</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                        </DropdownMenuGroup>

                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Kontrol Alarm</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleSimpleCommand("status")}>
                                Cek Status
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSimpleCommand("siaga")}>
                                Aktifkan SIAGA
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSimpleCommand("matikan")} className="text-red-600 dark:text-red-400">
                                Matikan Alarm
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </DropdownMenuGroup>

                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Nomor PIC Darurat</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleSimpleCommand("listpic")}>
                                Lihat Daftar PIC
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPicDialog("add")}>
                                Tambah PIC
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPicDialog("edit")}>
                                Edit PIC
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPicDialog("delete")} className="text-red-600 dark:text-red-400">
                                Hapus PIC
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {feedback && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">{feedback}</span>
                )}
            </div>

            {/* Dialog: Tambah PIC */}
            <Dialog open={picDialog === "add"} onOpenChange={(open) => !open && setPicDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Nomor PIC — {storeCode}</DialogTitle>
                        <DialogDescription>Mengirim /addpic {storeCode} +62xxx ke Telegram</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <label className="text-sm font-medium">Nomor Telepon</label>
                        <Input placeholder="+628123456789" value={picPhone} onChange={(e) => setPicPhone(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setPicDialog(null)}>Batal</Button>
                        <Button onClick={handlePicSubmit} disabled={!picPhone || loading}>
                            {loading ? "Mengirim..." : "Kirim Command"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Edit PIC */}
            <Dialog open={picDialog === "edit"} onOpenChange={(open) => !open && setPicDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Nomor PIC — {storeCode}</DialogTitle>
                        <DialogDescription>Mengirim /editpic {storeCode} [urutan] [nomor baru] ke Telegram</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div>
                            <label className="text-sm font-medium">Urutan PIC (1-5)</label>
                            <Input type="number" min="1" max="5" placeholder="1" value={picIndex} onChange={(e) => setPicIndex(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Nomor Telepon Baru</label>
                            <Input placeholder="+628123456789" value={picPhone} onChange={(e) => setPicPhone(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setPicDialog(null)}>Batal</Button>
                        <Button onClick={handlePicSubmit} disabled={!picIndex || !picPhone || loading}>
                            {loading ? "Mengirim..." : "Kirim Command"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Hapus PIC */}
            <Dialog open={picDialog === "delete"} onOpenChange={(open) => !open && setPicDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Nomor PIC — {storeCode}</DialogTitle>
                        <DialogDescription>Mengirim /delpic {storeCode} [urutan] ke Telegram</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <label className="text-sm font-medium">Urutan PIC yang akan dihapus (1-5)</label>
                        <Input type="number" min="1" max="5" placeholder="2" value={picIndex} onChange={(e) => setPicIndex(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setPicDialog(null)}>Batal</Button>
                        <Button variant="destructive" onClick={handlePicSubmit} disabled={!picIndex || loading}>
                            {loading ? "Mengirim..." : "Hapus PIC"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
