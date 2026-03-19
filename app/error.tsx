'use client'

import { useEffect } from 'react'
import ErrorFallback from '@/components/common/ErrorFallback'
import { logError } from '@/lib/logger'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logError({
      scope: 'app-segment-error',
      message: 'Unhandled error in app segment',
      error
    })
  }, [error])

  return (
    <div className='flex h-full w-full items-center justify-center px-4 py-10'>
      <ErrorFallback
        badge='App Error'
        title='頁面發生錯誤'
        description='目前無法正常顯示這個頁面。你可以重新嘗試載入內容。'
        actionLabel='重新載入'
        onAction={reset}
      />
    </div>
  )
}
