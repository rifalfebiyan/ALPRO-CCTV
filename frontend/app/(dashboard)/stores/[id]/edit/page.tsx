import { updateStoreAndNVR } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { createClient } from "@/lib/server"
import { notFound } from "next/navigation"

export default async function EditStorePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Ambil data toko untuk defaultValue
    const { data: store } = await supabase
        .from('stores')
        .select(`*, nvrs(*)`)
        .eq('id', id)
        .single()

    if (!store) {
        notFound()
    }

    const nvr = store.nvrs?.[0]

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 max-w-2xl mx-auto w-full h-full overflow-y-auto">
            <Card className="shadow-lg border-primary/20">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="text-xl">Edit Konfigurasi Toko & NVR</CardTitle>
                    <CardDescription>
                        Ubah pengaturan letak, IP, dan Kredensial untuk toko ini.
                    </CardDescription>
                </CardHeader>
                <form action={updateStoreAndNVR}>
                    {/* Hidden Inputs untuk ID */}
                    <input type="hidden" name="store_id" value={store.id} />
                    {nvr && <input type="hidden" name="nvr_id" value={nvr.id} />}

                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="store_code">Kode Toko</Label>
                                <Input id="store_code" name="store_code" defaultValue={store.store_code} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="region">Wilayah</Label>
                                <Input id="region" name="region" defaultValue={store.region} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap Toko</Label>
                            <Input id="name" name="name" defaultValue={store.name} required />
                        </div>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground font-semibold">
                                    Sistem NVR (Dahua / IMOU)
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ip_address">Serial Number (SN) / IP NVR (Wajib untuk Streaming)</Label>
                            <Input id="ip_address" name="ip_address" defaultValue={nvr?.ip_address} required placeholder="Contoh IP: 10.8.x.x" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username NVR</Label>
                                <Input id="username" name="username" defaultValue={nvr?.username || 'admin'} required placeholder="admin" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password NVR</Label>
                                {/* Kita bisa biarkan kosong kalau user ngga mau ubah, tapi lebih baik wajib di form ini */}
                                <Input id="password" name="password" type="password" required placeholder="********" defaultValue={nvr?.password || ''} />
                            </div>
                        </div>

                        <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-md text-xs border border-red-500/20">
                            <strong>Perhatian Keamanan:</strong> Jangan membagikan URL atau kredensial sembarangan. Password yang Anda inputkan akan disimpan ke Database secara rahasia dan akan dipakai otomatis oleh Media Server di port 8080 untuk meraup CCTV Anda.
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-muted/10 pt-4 border-t">
                        <Link href={`/stores/${store.id}`}>
                            <Button variant="ghost" type="button">Batal</Button>
                        </Link>
                        <Button type="submit">Update Konfigurasi</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
