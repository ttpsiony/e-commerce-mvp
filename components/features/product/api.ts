import { type ProductCardData } from '@/components/common/product/ProductCard'
import client from '@/lib/api/client'

export type ProductDetailData = ProductCardData & {
  specifications?: {
    material?: string
    size?: string
    color?: string
    weight?: string
    origin?: string
    warrantyMonths?: number
    features?: string[]
  }
  details?: string[]
  precautions?: string[]
}

export type RecommendationProductsResponse = {
  data: ProductCardData[]
}

export async function fetchRecommendations(productId: string, abortKey?: string) {
  return client.get<RecommendationProductsResponse>(`/api/product/${encodeURIComponent(productId)}/recommendations`, {
    abortKey
  })
}
