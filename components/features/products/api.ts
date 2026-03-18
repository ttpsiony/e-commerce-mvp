import { type ProductCardData } from '@/components/common/product/ProductCard'
import client from '@/lib/api/client'

export type ProductsResponse = {
  data: ProductCardData[]
  paging: {
    size: number
    next: string | null
    hasNext: boolean
    total: number
  }
}

export async function fetchProducts({
  limit,
  next,
  q,
  abortKey
}: {
  limit?: number
  next?: string | null
  q?: string
  abortKey?: string
}) {
  return client.get<ProductsResponse>('/api/products', {
    query: {
      limit,
      next,
      q
    },
    abortKey
  })
}
