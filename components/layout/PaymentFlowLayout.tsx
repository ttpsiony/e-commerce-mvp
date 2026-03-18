'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import { Button } from '@/components/ui/button'

type PaymentFlowLayoutProps = {
  children: ReactNode
  showBackButton?: boolean
}

export default function PaymentFlowLayout({ children, showBackButton = true }: PaymentFlowLayoutProps) {
  const router = useRouter()

  return (
    <section className='mx-auto w-full max-w-4xl px-4 py-6 pb-36 sm:py-8 sm:pb-40'>
      <div className={`mb-6 flex min-h-10 items-center gap-3 ${showBackButton ? 'justify-between' : 'justify-end'}`}>
        {showBackButton ? (
          <Button variant='outline' onClick={() => router.back()}>
            返回上一頁
          </Button>
        ) : null}
        <LanguageSwitcher />
      </div>

      {children}
    </section>
  )
}
