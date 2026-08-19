import { NextRequest, NextResponse } from "next/server"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!

async function sendTelegramMessage(text: string) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text }),
    })
    return res.json()
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { command, store_code, args } = body

        if (!command || !store_code) {
            return NextResponse.json({ error: "Missing command or store_code" }, { status: 400 })
        }

        let message = ""

        switch (command) {
            // === Kontrol Alarm ===
            case "siaga":
                message = `/siaga ${store_code}`
                break
            case "matikan":
                message = `/matikan ${store_code}`
                break
            case "status":
                message = `/status ${store_code}`
                break

            // === CRUD Nomor PIC ===
            case "addpic":
                if (!args?.phone) return NextResponse.json({ error: "Missing phone number" }, { status: 400 })
                message = `/addpic ${store_code} ${args.phone}`
                break
            case "listpic":
                message = `/listpic ${store_code}`
                break
            case "editpic":
                if (!args?.index || !args?.phone) return NextResponse.json({ error: "Missing index or phone" }, { status: 400 })
                message = `/editpic ${store_code} ${args.index} ${args.phone}`
                break
            case "delpic":
                if (!args?.index) return NextResponse.json({ error: "Missing index" }, { status: 400 })
                message = `/delpic ${store_code} ${args.index}`
                break

            default:
                return NextResponse.json({ error: `Unknown command: ${command}` }, { status: 400 })
        }

        const result = await sendTelegramMessage(message)

        if (!result.ok) {
            console.error("Telegram API error:", result)
            return NextResponse.json({ error: "Gagal mengirim ke Telegram", detail: result.description }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            command: message,
            message: `Command "${message}" berhasil dikirim ke Telegram.`,
        })

    } catch (err: any) {
        console.error("Alarm action error:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
