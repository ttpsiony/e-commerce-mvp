'use client'

import { useEffect } from 'react'
import ErrorFallback from '@/components/common/ErrorFallback'
import { logError } from '@/lib/logger'

type ProductErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProductErrorPage({ error, reset }: ProductErrorPageProps) {
  useEffect(() => {
    logError({
      scope: 'product-detail-page',
      message: 'Failed to load product detail page',
      error
    })
  }, [error])

  return (
    <main className='mx-auto flex min-h-[60vh] w-full max-w-6xl items-center justify-center px-4 py-10'>
      <ErrorFallback
        badge='Product Error'
        title='商品資料載入失敗'
        description='目前無法取得商品資訊，可能是暫時性的連線或服務問題。你可以立即重新嘗試取得資料。'
        actionLabel='重新取得資料'
        onAction={reset}
      />
    </main>
  )
}
