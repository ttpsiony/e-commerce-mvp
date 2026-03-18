'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'

const BrandStorySection = dynamic(() => import('@/components/features/home/BrandStorySection'), {
  loading: () => <div className='mx-auto h-80 w-full max-w-6xl animate-pulse rounded-2xl bg-zinc-100 px-4' />
})

export default function LazyBrandStorySection() {
  const triggerRef = React.useRef<HTMLDivElement | null>(null)
  const [shouldLoad, setShouldLoad] = React.useState(false)

  React.useEffect(() => {
    const target = triggerRef.current
    if (!target || shouldLoad) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      {
        // Start loading slightly before the section enters viewport.
        rootMargin: '300px 0px'
      }
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [shouldLoad])

  return (
    <div ref={triggerRef}>
      {shouldLoad ? (
        <BrandStorySection />
      ) : (
        <div className='mx-auto h-80 w-full max-w-6xl animate-pulse rounded-2xl bg-zinc-100 px-4' />
      )}
    </div>
  )
}
