'use client'

import { useEffect, useRef, useState } from 'react'
import type { ProductDetailData } from '@/components/features/product/api'
import { Button } from '@/components/ui/button'
import { useCart } from '@/shared/hooks/useCart'
import { formatCurrency } from '@/shared/utils/currency'

type ProductPurchaseBarProps = {
  product: ProductDetailData
}

export default function ProductPurchaseBar({ product }: ProductPurchaseBarProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const resetAddedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSellable = product.state === 'ACTIVE'

  useEffect(() => {
    return () => {
      if (resetAddedTimerRef.current) {
        clearTimeout(resetAddedTimerRef.current)
      }
    }
  }, [])

  return (
    <div className='fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur'>
      <div className='mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3'>
        <div>
          <p className='text-xs text-zinc-500'>價格</p>
          <p className='text-lg font-bold text-zinc-900'>{formatCurrency(product.price ?? 0)}</p>
        </div>
        <Button
          size='lg'
          disabled={!isSellable}
          onClick={() => {
            if (!isSellable) return

            addItem({
              id: product.id,
              name: product.name || 'Unnamed Product',
              image: product.image || '/next.svg',
              price: product.price ?? 0,
              originalPrice: product.originalPrice ?? product.price ?? 0,
              quantity: 1
            })

            if (resetAddedTimerRef.current) {
              clearTimeout(resetAddedTimerRef.current)
            }

            setAdded(true)
            resetAddedTimerRef.current = setTimeout(() => {
              setAdded(false)
              resetAddedTimerRef.current = null
            }, 1200)
          }}
        >
          {!isSellable ? '目前無法購買' : added ? '已加入購物車' : '加入購物車'}
        </Button>
      </div>
    </div>
  )
}
