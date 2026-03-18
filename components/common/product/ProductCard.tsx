'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/shared/utils/currency'

export type ProductCardData = {
  id: string
  name: string
  description?: string
  image: string
  state: string
  price: number
  originalPrice: number
  tags: string[]
}

type ProductCardProps = {
  product: ProductCardData
}

type LinkProductCardProps = {
  product: ProductCardData
  href?: React.ComponentProps<typeof Link>['href']
  className?: string
  ariaLabel?: string
  linkProps?: Omit<React.ComponentProps<typeof Link>, 'children' | 'href' | 'className'>
  prefetchMode?: 'viewport' | 'interaction' | 'none'
  prefetchTriggers?: Array<'hover' | 'focus' | 'touch'>
  prefetchDelay?: number
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className='flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'>
      <div className='relative aspect-4/3 w-full overflow-hidden bg-zinc-100'>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
          className='object-cover transition duration-300 hover:scale-105'
          loading='lazy'
        />
      </div>

      <div className='flex flex-1 flex-col gap-3 p-4'>
        <div className='flex items-center justify-between gap-2'>
          <h3 className='line-clamp-1 text-base font-semibold text-zinc-900'>{product.name}</h3>
          <span className='rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600'>
            {product.state}
          </span>
        </div>

        {product.description ? <p className='line-clamp-2 text-sm text-zinc-600'>{product.description}</p> : null}

        {product.tags.length > 0 ? (
          <div className='flex flex-wrap gap-1'>
            {product.tags.map((tag) => (
              <span key={`${product.id}-${tag}`} className='rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600'>
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className='mt-auto flex items-baseline gap-2 pt-1'>
          <span className='text-lg font-bold text-zinc-900'>{formatCurrency(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className='text-sm text-zinc-400 line-through'>{formatCurrency(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </article>
  )
}

export function LinkProductCard({
  product,
  href,
  className,
  ariaLabel,
  linkProps,
  prefetchMode = 'interaction',
  prefetchTriggers = ['hover'],
  prefetchDelay = 0
}: LinkProductCardProps) {
  const [isPrefetchEnabled, setIsPrefetchEnabled] = React.useState(prefetchMode === 'viewport')
  const timerRef = React.useRef<number | null>(null)
  const hasHoverTrigger = prefetchTriggers.includes('hover')
  const hasFocusTrigger = prefetchTriggers.includes('focus')
  const hasTouchTrigger = prefetchTriggers.includes('touch')

  React.useEffect(() => {
    if (prefetchMode === 'viewport') {
      setIsPrefetchEnabled(true)
      return
    }

    setIsPrefetchEnabled(false)
  }, [prefetchMode, href])

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const schedulePrefetch = React.useCallback(() => {
    if (prefetchMode !== 'interaction' || isPrefetchEnabled) return

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (prefetchDelay <= 0) {
      setIsPrefetchEnabled(true)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setIsPrefetchEnabled(true)
      timerRef.current = null
    }, prefetchDelay)
  }, [isPrefetchEnabled, prefetchDelay, prefetchMode])

  const { onMouseEnter, onFocus, onTouchStart, prefetch: prefetchFromLinkProps, ...restLinkProps } = linkProps ?? {}

  // Next.js automatically prefetches links in the viewport when using the <Link> component
  const prefetch =
    prefetchFromLinkProps !== undefined ? prefetchFromLinkProps : prefetchMode === 'none' ? false : isPrefetchEnabled

  return (
    <Link
      href={href ?? `/product/${product.id}`}
      aria-label={ariaLabel ?? `View details for ${product.name}`}
      className={
        className ??
        'block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2'
      }
      prefetch={prefetch}
      onMouseEnter={(event) => {
        if (hasHoverTrigger) {
          schedulePrefetch()
        }
        onMouseEnter?.(event)
      }}
      onFocus={(event) => {
        if (hasFocusTrigger) {
          schedulePrefetch()
        }
        onFocus?.(event)
      }}
      onTouchStart={(event) => {
        if (hasTouchTrigger) {
          schedulePrefetch()
        }
        onTouchStart?.(event)
      }}
      {...restLinkProps}
    >
      <ProductCard product={product} />
    </Link>
  )
}
