'use client'

import { useEffect } from 'react'
import ErrorFallback from '@/components/common/ErrorFallback'
import { logError } from '@/lib/logger'

type GlobalErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    logError({
      scope: 'root-error-boundary',
      message: 'Unhandled error in root layout',
      error
    })
  }, [error])

  return (
    <html lang='zh-TW'>
      <body className='bg-white text-zinc-900 antialiased'>
        <main className='flex min-h-screen items-center justify-center px-4 py-10'>
          <ErrorFallback
            badge='Global Error'
            title='頁面發生未預期錯誤'
            description='應用程式目前無法正常顯示。你可以先重新嘗試載入，如果問題持續發生，再檢查服務或資料來源狀態。'
            actionLabel='重新載入頁面'
            onAction={reset}
          />
        </main>
      </body>
    </html>
  )
}
