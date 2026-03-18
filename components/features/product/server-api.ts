import 'server-only'

import type { ProductDetailData } from '@/components/features/product/api'
import { getSiteUrl } from '@/shared/utils/domain'

export function getProductRevalidateTag(id: string) {
  return `product:${id}`
}

function buildProductUrl(id: string) {
  return new URL(`/api/product/${encodeURIComponent(id)}`, getSiteUrl()).toString()
}

export async function fetchProductForISR(id: string): Promise<ProductDetailData | null> {
  const response = await fetch(buildProductUrl(id), {
    next: {
      revalidate: 600,
      tags: [getProductRevalidateTag(id)]
    }
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch product for ISR: ${response.status}`)
  }

  return response.json()
}
