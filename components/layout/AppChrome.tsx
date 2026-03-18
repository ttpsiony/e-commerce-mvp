'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/common/Header'

type AppChromeProps = {
  children: React.ReactNode
}

export default function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname()
  const hideHeader = pathname === '/cart' || pathname.startsWith('/checkout') || pathname.startsWith('/order/complete')

  return (
    <>
      {!hideHeader ? (
        <div className='fixed inset-x-0 top-0 z-50'>
          <Header />
        </div>
      ) : null}
      <main className={hideHeader ? undefined : 'pt-20'}>{children}</main>
    </>
  )
}
