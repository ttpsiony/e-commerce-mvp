'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LinkProductCard, type ProductCardData } from '@/components/common/product/ProductCard'
import ProductCardSkeleton from '@/components/common/product/ProductCardSkeleton'
import { fetchProducts, type ProductsResponse } from '@/components/features/products/api'
import { normalizeProducts, upsertProducts } from '@/components/features/products/utils'
import { Input } from '@/components/ui/input'
import client from '@/lib/api/client'

const PRODUCT_SIZE = 12
const SEARCH_DEBOUNCE_MS = 600
const SEARCH_ABORT_KEY = 'products-search'

type ProductListClientProps = {
  initialData: ProductCardData[]
  initialPaging: ProductsResponse['paging']
  initialKeyword?: string
}

export default function ProductListClient({
  initialData = [],
  initialPaging,
  initialKeyword = ''
}: ProductListClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [keyword, setKeyword] = React.useState(initialKeyword)
  const [appliedKeyword, setAppliedKeyword] = React.useState(initialKeyword.trim())
  const [products, setProducts] = React.useState<ProductCardData[]>(() => normalizeProducts(initialData))
  const [nextCursor, setNextCursor] = React.useState<string | null>(initialPaging.next)
  const [hasNext, setHasNext] = React.useState(initialPaging.hasNext)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)

  const loadMoreRef = React.useRef<HTMLDivElement | null>(null)
  const hasMountedSearchEffect = React.useRef(false)
  const normalizedKeyword = React.useMemo(() => keyword.trim(), [keyword])
  const loadMoreSkeletonCount = React.useMemo(() => {
    const remainder = products.length % 4
    const fillToNextMultiple = remainder === 0 ? 0 : 4 - remainder
    return fillToNextMultiple + 4
  }, [products.length])

  // sync query string to url
  React.useEffect(() => {
    const currentQuery = searchParams.get('q')?.trim() ?? ''
    if (currentQuery === appliedKeyword) return

    const params = new URLSearchParams(searchParams.toString())
    if (appliedKeyword) {
      params.set('q', appliedKeyword)
    } else {
      params.delete('q')
    }

    const queryString = params.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }, [appliedKeyword, pathname, router, searchParams])

  // cancel in-flight request within next debounced time
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedKeyword(normalizedKeyword)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      client.abort.cancel(SEARCH_ABORT_KEY)
    }
  }, [normalizedKeyword])

  // skip initial fetch; first data is already from SSR
  React.useEffect(() => {
    const run = async () => {
      if (!hasMountedSearchEffect.current) {
        hasMountedSearchEffect.current = true
        return
      }

      try {
        setIsLoading(true)

        const response = await fetchProducts({
          limit: PRODUCT_SIZE,
          q: appliedKeyword || undefined,
          abortKey: SEARCH_ABORT_KEY
        })

        setProducts(normalizeProducts(response.data))
        setNextCursor(response.paging.next)
        setHasNext(response.paging.hasNext)
      } catch {
      } finally {
        setIsLoading(false)
      }
    }

    run()
  }, [appliedKeyword])

  // observe load more action
  React.useEffect(() => {
    const target = loadMoreRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      async (entries) => {
        const firstEntry = entries[0]
        if (
          !firstEntry?.isIntersecting ||
          !hasNext ||
          isLoading ||
          isLoadingMore ||
          !nextCursor ||
          normalizedKeyword !== appliedKeyword
        ) {
          return
        }

        try {
          setIsLoadingMore(true)

          const response = await fetchProducts({
            limit: PRODUCT_SIZE,
            next: nextCursor,
            q: appliedKeyword || undefined
          })

          setProducts((prev) => upsertProducts(prev, response.data))
          setNextCursor(response.paging.next)
          setHasNext(response.paging.hasNext)
        } catch {
        } finally {
          setIsLoadingMore(false)
        }
      },
      {
        rootMargin: '150px 0px'
      }
    )

    observer.observe(target)
    return () => {
      observer.disconnect()
    }
  }, [hasNext, isLoading, isLoadingMore, appliedKeyword, normalizedKeyword, nextCursor])

  return (
    <section className='mx-auto w-full max-w-6xl px-4 py-8 sm:py-10'>
      <div className='mb-6 space-y-3'>
        <h1 className='text-2xl font-bold text-zinc-900 sm:text-3xl'>商品列表</h1>
        <Input
          type='search'
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder='搜尋商品名稱、描述或標籤'
          className='h-auto rounded-lg border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 transition focus-visible:border-zinc-500 focus-visible:ring-zinc-300/80'
        />
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={`search-loading-${index}`} />
          ))}
        </div>
      ) : (
        <>
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
            {isLoadingMore
              ? Array.from({ length: loadMoreSkeletonCount }).map((_, index) => (
                  <ProductCardSkeleton key={`load-more-${index}`} />
                ))
              : null}
          </div>

          {products.length === 0 ? <p className='py-10 text-center text-zinc-500'>找不到符合條件的商品</p> : null}
        </>
      )}

      <div ref={loadMoreRef} className='h-8 w-full' />
    </section>
  )
}
