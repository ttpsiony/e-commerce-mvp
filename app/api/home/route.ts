import { getProducts } from '@/server/dataSource/productSource'

const carouselImages = [
  {
    src: 'https://picsum.photos/seed/home-hero-living/1920/1080',
    alt: '客廳情境中的家居選品主視覺'
  },
  {
    src: 'https://picsum.photos/seed/home-hero-workspace/1920/1080',
    alt: '桌面工作空間情境的生活風格主視覺'
  },
  {
    src: 'https://picsum.photos/seed/home-hero-travel/1920/1080',
    alt: '旅行與日常攜帶商品情境主視覺'
  },
  {
    src: 'https://picsum.photos/seed/home-hero-lighting/1920/1080',
    alt: '燈具與居家佈置風格主視覺'
  },
  {
    src: 'https://picsum.photos/seed/home-hero-minimal/1920/1080',
    alt: '極簡生活風格商品展示主視覺'
  }
]

export async function GET() {
  // 整合 多支 API 減少 request
  const products = await getProducts({ limit: 4 })

  return Response.json({
    images: carouselImages,
    hotProducts: products.data
  })
}
