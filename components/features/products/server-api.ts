import 'server-only'

// 解決 SSR 渲染過久的問題，透過 fetch 機制，也可以加 tags，使用 revalidate() 去更新快取
// lighthouse performance: 80 -> 90up
import type { ProductsResponse } from '@/components/features/products/api'
import { getSiteUrl } from '@/shared/utils/domain'

function buildProductsUrl(q?: string) {
  const params = new URLSearchParams()

  if (q) {
    params.set('q', q)
  }

  const queryString = params.toString()
  const path = queryString ? `/api/products?${queryString}` : '/api/products'

  return new URL(path, getSiteUrl()).toString()
}

export async function fetchProductsForSSR(q?: string): Promise<ProductsResponse> {
  const response = await fetch(buildProductsUrl(q), {
    next: {
      revalidate: 600
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch products for SSR: ${response.status}`)
  }

  return response.json()
}
