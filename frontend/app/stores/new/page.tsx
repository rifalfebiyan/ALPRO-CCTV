import { addStoreAndNVR } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function NewStorePage() {
    return (
        <div className="flex-1 p-4 md:p-8 pt-6 max-w-2xl mx-auto w-full">
            <Card className="shadow-lg border-primary/20">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="text-xl">Registrasi Toko & CCTV Baru</CardTitle>
                    <CardDescription>
                        Masukkan informasi toko dan konfigurasi koneksi jaringan NVR Dahua Anda.
                    </CardDescription>
                </CardHeader>
                <form action={addStoreAndNVR}>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="store_code">Kode Toko</Label>
                                <Input id="store_code" name="store_code" required placeholder="Contoh: SBY-001" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="region">Wilayah</Label>
                                <Input id="region" name="region" required placeholder="Misal: Surabaya" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap Toko</Label>
                            <Input id="name" name="name" required placeholder="Toko Cabang Surabaya Pusat Utama" />
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ip_address">Serial Number (SN) / IP NVR</Label>
                                <Input id="ip_address" name="ip_address" required placeholder="Contoh SN: 4M00EACPAZ... atau IP: 10.8.x.x" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="channels">Total Channel Kamera (CCTV)</Label>
                                <Input id="channels" name="channels" type="number" min="1" max="64" required defaultValue="8" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username NVR</Label>
                                <Input id="username" name="username" defaultValue="admin" required placeholder="admin" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password NVR</Label>
                                <Input id="password" name="password" type="password" required placeholder="********" />
                            </div>
                        </div>

                        <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md text-xs border border-blue-500/20">
                            <strong>Catatan Arsitektur Dahua:</strong> Kamera tipe IMOU Anda terhubung ke NVR Dahua. Di dashboard ini, Anda hanya perlu mendaftarkan 1 IP Address NVR Dahua saja. Sistem akan otomatis mendaftarkan masing-masing Channel kameranya.
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-muted/10 pt-4 border-t">
                        <Link href="/stores">
                            <Button variant="ghost" type="button">Batal</Button>
                        </Link>
                        <Button type="submit">Simpan & Registrasi NVR</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
