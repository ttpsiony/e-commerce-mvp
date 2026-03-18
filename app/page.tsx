import HomeCarousel from '@/components/features/home/HomeCarousel'
import HotProductsSection from '@/components/features/home/HotProductsSection'
import { type ProductCardData } from '@/components/common/product/ProductCard'
import client from '@/lib/api/client'
import LazyBrandStorySection from '@/components/features/home/LazyBrandStorySection'

type HomePageResponse = {
  images: Array<{
    src: string
    alt: string
  }>
  hotProducts: ProductCardData[]
}

async function getHomePageData(): Promise<HomePageResponse> {
  return client.get<HomePageResponse>('/api/home')
}

export default async function Home() {
  const { images, hotProducts } = await getHomePageData()

  return (
    <div className='min-h-screen bg-zinc-50 font-sans'>
      <HomeCarousel images={images} />
      <HotProductsSection products={hotProducts} />
      <LazyBrandStorySection />
    </div>
  )
}
