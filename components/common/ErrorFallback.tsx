'use client'

import { Button } from '@/components/ui/button'

type ErrorFallbackProps = {
  badge: string
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  className?: string
}

export default function ErrorFallback({
  badge,
  title,
  description,
  actionLabel,
  onAction,
  className
}: ErrorFallbackProps) {
  return (
    <section
      className={`flex w-full max-w-md flex-col items-center rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm sm:p-8 ${className ?? ''}`.trim()}
    >
      <p className='text-sm font-medium text-zinc-500'>{badge}</p>
      <h1 className='mt-2 text-2xl font-bold text-zinc-900'>{title}</h1>
      <p className='mt-3 text-sm leading-6 text-zinc-600'>{description}</p>
      <Button className='mt-6' onClick={onAction}>
        {actionLabel}
      </Button>
    </section>
  )
}
