import HomeCarousel from '@/components/features/home/HomeCarousel'
import HotProductsSection from '@/components/features/home/HotProductsSection'
import LazyBrandStorySection from '@/components/features/home/LazyBrandStorySection'
import { fetchHomePageData } from '@/components/features/home/server-api'

export default async function Home() {
  const { images, hotProducts } = await fetchHomePageData()

  return (
    <div className='min-h-screen bg-zinc-50 font-sans'>
      <HomeCarousel images={images} />
      <HotProductsSection products={hotProducts} />
      <LazyBrandStorySection />
    </div>
  )
}
