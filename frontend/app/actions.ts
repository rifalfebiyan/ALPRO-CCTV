"use server"
import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"

export async function addStoreAndNVR(formData: FormData) {
    const supabase = await createClient()

    const store_code = formData.get('store_code') as string
    const name = formData.get('name') as string
    const region = formData.get('region') as string
    const ip_address = formData.get('ip_address') as string
    const username = formData.get('username') as string || 'admin'
    const password = formData.get('password') as string
    const channels = parseInt(formData.get('channels') as string) || 8

    // 1. Insert Store
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert([{ store_code, name, region, status: 'Online' }])
        .select()
        .single()

    if (storeError) {
        console.error(storeError)
        throw new Error('Gagal menambahkan toko (Store Code mungkin duplikat)')
    }

    // 2. Insert NVR (Dahua / IMOU System)
    const { data: nvr, error: nvrError } = await supabase
        .from('nvrs')
        .insert([{
            store_id: store.id,
            model: 'Dahua NVR (IMOU)',
            ip_address,
            username,
            password,
            status: 'Online',
            storage_total_tb: 1.0,
            storage_used_tb: 0.1,
            cpu_usage_pct: 12,
            network_bandwidth_mbps: 4.5
        }])
        .select()
        .single()

    if (nvrError) throw new Error('Gagal menambahkan konfigurasi NVR')

    // 3. Generate Camera rows for the NVR dynamically (1 - N channels)
    const cameraInserts = Array.from({ length: channels }).map((_, i) => ({
        nvr_id: nvr.id,
        channel_number: i + 1,
        name: `Titik Pantau ${i + 1}`,
        is_offline: false,
        resolution: '1080p'
    }))

    const { error: camError } = await supabase.from('cameras').insert(cameraInserts)
    if (camError) throw new Error('Gagal menambahkan kamera DVR')

    // Balik ke dashboard list toko
    redirect('/stores')
}

export async function updateStoreAndNVR(formData: FormData) {
    const supabase = await createClient()

    const store_id = formData.get('store_id') as string
    const nvr_id = formData.get('nvr_id') as string
    const store_code = formData.get('store_code') as string
    const name = formData.get('name') as string
    const region = formData.get('region') as string
    const ip_address = formData.get('ip_address') as string
    const username = formData.get('username') as string || 'admin'
    const password = formData.get('password') as string

    // Update Store
    await supabase.from('stores')
        .update({ store_code, name, region })
        .eq('id', store_id)

    // Update NVR
    if (nvr_id) {
        await supabase.from('nvrs')
            .update({ ip_address, username, password })
            .eq('id', nvr_id)
    } else if (ip_address) {
        // If NVR didn't exist before but IP is provided now, we can insert it.
        await supabase.from('nvrs').insert([{
            store_id: store_id,
            model: 'Dahua NVR (IMOU)',
            ip_address,
            username,
            password,
            status: 'Online'
        }])
    }

    // Redirect ke halaman detail toko yang diedit
    redirect(`/stores/${store_id}`)
}
