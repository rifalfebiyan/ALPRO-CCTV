import { createClient } from '@/lib/server'
import { NotificationNav } from '@/components/notification-nav'

export async function NotificationNavServer() {
    const supabase = await createClient()
    const { data: alerts } = await supabase
        .from('alerts')
        .select(`
            id, severity, issue_description, created_at,
            stores ( name )
        `)
        .eq('is_resolved', false)
        .eq('severity', 'high')
        .order('created_at', { ascending: false })
        .limit(5)

    return <NotificationNav alerts={(alerts as any) || []} />
}
