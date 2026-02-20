import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'نوع الملف غير مدعوم. يرجى رفع صورة (JPG, PNG, WebP, GIF)' }, { status: 400 })
        }

        // Validate file size (max 20MB)
        const maxSize = 20 * 1024 * 1024 // 20MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'حجم الملف كبير جداً. الحد الأقصى 20 ميجابايت' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate content-based hash to prevent duplicates
        const fileHash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 12)
        const ext = path.extname(file.name) || '.jpg'
        const filename = `${fileHash}${ext}`

        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        const filepath = path.join(uploadDir, filename)

        // Only write if file doesn't already exist (dedup by content hash)
        if (!existsSync(filepath)) {
            await writeFile(filepath, buffer)
        }

        // Return the public URL
        const publicUrl = `/uploads/${filename}`

        return NextResponse.json({ url: publicUrl })
    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: `فشل رفع الملف: ${error?.message || 'خطأ غير معروف'}` }, { status: 500 })
    }
}
