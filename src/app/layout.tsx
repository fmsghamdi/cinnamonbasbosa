import type { Metadata } from 'next'
import { Tajawal, Cairo } from 'next/font/google'
import './globals.css'

const tajawal = Tajawal({ subsets: ['arabic', 'latin'], weight: ['300', '400', '500', '700', '800'], variable: '--font-body' })
const cairo = Cairo({ subsets: ['arabic', 'latin'], weight: ['400', '600', '700', '800', '900'], variable: '--font-heading' })

export const metadata: Metadata = {
  title: 'بسبوسة القرفة | Cinnamon Basbosa - أشهى البسبوسة في مكة',
  description: 'بسبوسة القرفة - أشهى بسبوسة محشوة بالقرفة في مكة المكرمة. اطلب الآن واستمتع بطعم الأصالة مع خدمة التوصيل.',
  keywords: 'بسبوسة, بسبوسة القرفة, حلويات مكة, توصيل حلويات, basbosa, cinnamon basbosa',
  openGraph: {
    title: 'بسبوسة القرفة | Cinnamon Basbosa',
    description: 'أشهى بسبوسة محشوة بالقرفة في مكة المكرمة. اطلب الآن!',
    type: 'website',
    locale: 'ar_SA',
  },
}

import { Providers } from '@/components/Providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${tajawal.variable} ${cairo.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
