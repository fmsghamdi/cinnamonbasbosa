import prisma from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import ProductGrid from '@/components/ProductGrid'
import Gallery from '@/components/Gallery'
import Cart from '@/components/Cart'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <>
      <Navbar />
      <Cart />
      <Hero />
      <ProductGrid products={products} />
      <Gallery />
      <Footer />
    </>
  )
}
