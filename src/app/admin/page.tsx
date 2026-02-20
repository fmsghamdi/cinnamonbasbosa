import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
    const cookieStore = await cookies()
    const hasSession = cookieStore.get('admin_session')

    if (hasSession) {
        redirect('/admin/dashboard')
    } else {
        redirect('/admin/login')
    }
}
