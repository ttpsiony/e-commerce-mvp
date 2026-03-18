'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'

type HomeCarouselProps = {
  images: Array<{
    src: string
    alt: string
  }>
}

function normalizeIndex(index: number, total: number) {
  return ((index % total) + total) % total
}

export default function HomeCarousel({ images }: HomeCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [loadableIndexes, setLoadableIndexes] = React.useState<number[]>(() => (images.length > 0 ? [0] : []))

  const markIndexesAsLoadable = React.useEffectEvent((indexes: number[]) => {
    if (images.length === 0) return

    setLoadableIndexes((previous) => {
      const next = new Set(previous)
      let hasChanges = false

      for (const index of indexes) {
        const normalizedIndex = normalizeIndex(index, images.length)
        if (!next.has(normalizedIndex)) {
          next.add(normalizedIndex)
          hasChanges = true
        }
      }

      return hasChanges ? [...next].sort((a, b) => a - b) : previous
    })
  })

  React.useEffect(() => {
    setCurrent(0)
    setLoadableIndexes(images.length > 0 ? [0] : [])
  }, [images])

  React.useEffect(() => {
    if (!api) return

    const onSelect = () => {
      const selectedIndex = api.selectedScrollSnap()
      setCurrent(selectedIndex)
      markIndexesAsLoadable([selectedIndex])
    }

    onSelect()
    api.on('select', onSelect)

    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  const handlePreloadNextImage = () => {
    if (images.length === 0) return
    markIndexesAsLoadable([current + 1])
  }

  const handlePreloadPreviousImage = () => {
    if (images.length === 0) return
    markIndexesAsLoadable([current - 1])
  }

  return (
    <section className='w-full overflow-hidden bg-zinc-950'>
      <Carousel setApi={setApi} opts={{ loop: true }} className='w-full'>
        <CarouselContent className='ml-0'>
          {images.map((src, index) => {
            const shouldLoadImage = loadableIndexes.includes(index)

            return (
              <CarouselItem key={src.src} className='pl-0'>
                <div className='relative h-[56vh] min-h-80 w-full sm:h-[68vh] lg:h-[calc(100vh-5rem)]'>
                  {shouldLoadImage ? (
                    <Image
                      src={src.src}
                      alt={src.alt}
                      fill
                      priority={index === 0}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      sizes='(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 100vw'
                      className='object-cover'
                    />
                  ) : (
                    <div className='h-full w-full animate-pulse bg-zinc-800' />
                  )}
                  <div className='absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-black/10' />
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>

        <CarouselPrevious
          onMouseEnter={handlePreloadPreviousImage}
          onFocus={handlePreloadPreviousImage}
          onTouchStart={handlePreloadPreviousImage}
          className='left-3 top-1/2 z-20 h-9 w-9 -translate-y-1/2 border-white/50 bg-black/35 text-white hover:bg-black/55 md:left-6 md:h-11 md:w-11'
        />
        <CarouselNext
          onMouseEnter={handlePreloadNextImage}
          onFocus={handlePreloadNextImage}
          onTouchStart={handlePreloadNextImage}
          className='right-3 top-1/2 z-20 h-9 w-9 -translate-y-1/2 border-white/50 bg-black/35 text-white hover:bg-black/55 md:right-6 md:h-11 md:w-11'
        />
      </Carousel>

      <div className='flex items-center justify-center gap-2 bg-zinc-950 py-3'>
        {images.map((_, index) => (
          <button
            key={index}
            type='button'
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              index === current ? 'w-8 bg-white' : 'w-4 bg-zinc-500 hover:bg-zinc-300'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
