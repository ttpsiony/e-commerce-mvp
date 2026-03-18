'use client'

import dynamic from 'next/dynamic'
import type { ProductDetailData } from '@/components/features/product/api'

const ProductPurchaseBar = dynamic(() => import('@/components/features/product/ProductPurchaseBar'), {
  ssr: false
})

type ProductPurchaseBarClientProps = {
  product: ProductDetailData
}

export default function ProductPurchaseBarClient({ product }: ProductPurchaseBarClientProps) {
  return <ProductPurchaseBar product={product} />
}
