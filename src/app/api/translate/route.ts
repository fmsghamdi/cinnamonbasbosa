import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        // Optional: Ensure only staff can access this translation API
        const session = await requirePermission('products')
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { text, from = 'ar', to = 'en' } = await request.json()

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 })
        }

        // Using Google Translate's free API endpoint
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`

        const response = await fetch(url)
        if (!response.ok) {
            throw new Error('Translation API failed')
        }

        const data = await response.json()

        // Extract the translated text from the nested array response
        const translatedText = data[0]?.map((item: any) => item[0]).join('') || ''

        return NextResponse.json({ translatedText })
    } catch (error) {
        console.error('Translation error:', error)
        return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
    }
}
