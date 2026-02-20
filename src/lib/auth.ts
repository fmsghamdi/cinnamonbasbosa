import { cookies } from 'next/headers'

/**
 * Check if the current request is from an authenticated admin or staff member.
 * Returns { isAdmin, isStaff, staffPermissions } or null if not authenticated.
 */
export async function getSession() {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')
    const staffSession = cookieStore.get('staff_session')

    const isAdmin = adminSession?.value === 'true'

    let staffData: { id: number; name: string; role: string; permissions: string[] } | null = null
    if (staffSession?.value) {
        try {
            staffData = JSON.parse(staffSession.value)
        } catch {
            staffData = null
        }
    }

    if (!isAdmin && !staffData) return null

    return {
        isAdmin,
        isStaff: !!staffData,
        staffData,
        hasPermission: (perm: string) => {
            if (isAdmin) return true
            if (staffData?.role === 'manager') return true
            return staffData?.permissions?.includes(perm) || false
        }
    }
}

/**
 * Quick check: is the user an admin?
 */
export async function requireAdmin() {
    const session = await getSession()
    if (!session?.isAdmin) return null
    return session
}

/**
 * Quick check: is the user an admin or has specific permission?
 */
export async function requirePermission(permission: string) {
    const session = await getSession()
    if (!session) return null
    if (!session.hasPermission(permission)) return null
    return session
}
