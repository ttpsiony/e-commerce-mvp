'use client'

import * as React from 'react'
import { fetchRecommendations } from '@/components/features/product/api'
import { LinkProductCard, type ProductCardData } from '@/components/common/product/ProductCard'
import ProductCardSkeleton from '@/components/common/product/ProductCardSkeleton'
import client from '@/lib/api/client'

type RecommendationProductsSectionProps = {
  productId: string
}

export default function RecommendationProductsSection({ productId }: RecommendationProductsSectionProps) {
  const sectionRef = React.useRef<HTMLElement | null>(null)
  const [shouldLoad, setShouldLoad] = React.useState(false)
  const [products, setProducts] = React.useState<ProductCardData[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    const target = sectionRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0]
        if (!firstEntry?.isIntersecting) return
        setShouldLoad(true)
        observer.disconnect()
      },
      {
        // Start fetching shortly before user reaches this section.
        rootMargin: '100px 0px'
      }
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [])

  React.useEffect(() => {
    if (!shouldLoad) return

    const abortKey = `product-recommendations-${productId}`

    const run = async () => {
      try {
        setIsLoading(true)
        setHasError(false)

        const result = await fetchRecommendations(productId, abortKey)
        setProducts(result.data ?? [])
      } catch {
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    run()

    return () => {
      client.abort.cancel(abortKey)
    }
  }, [productId, shouldLoad])

  return (
    <section ref={sectionRef} className='space-y-4'>
      {shouldLoad && (
        <>
          <h2 className='text-xl font-bold text-zinc-900'>推薦相似商品</h2>

          {hasError ? <p className='text-sm text-zinc-500'>推薦商品暫時載入失敗，請稍後重新整理。</p> : null}

          {isLoading ? (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {Array.from({ length: 4 }).map((_, index) => (
                <ProductCardSkeleton key={`recommendation-loading-${index}`} />
              ))}
            </div>
          ) : null}

          {!isLoading && products.length > 0 ? (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {products.map((product) => (
                <LinkProductCard
                  key={product.id}
                  product={product}
                  href={`/product/${product.id}`}
                  ariaLabel={`查看商品「${product.name}」詳細資訊`}
                  prefetchTriggers={['hover', 'touch']}
                />
              ))}
            </div>
          ) : null}

          {!isLoading && !hasError && products.length === 0 ? (
            <p className='text-sm text-zinc-500'>目前沒有可推薦的相似商品。</p>
          ) : null}
        </>
      )}
    </section>
  )
}
