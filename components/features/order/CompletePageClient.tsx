'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { fetchOrderSummary, OrderApiError } from '@/components/features/order/api'
import { ORDER_COMPLETE_EMAIL_STORAGE_KEY } from '@/components/features/order/constants'
import PaymentFlowLayout from '@/components/layout/PaymentFlowLayout'
import { Button } from '@/components/ui/button'
import type { OrderSummaryResponse } from '@/components/features/order/checkout/types'

export default function CompletePageClient() {
  const searchParams = useSearchParams()
  const orderNo = searchParams.get('orderNo')
  const [summary, setSummary] = useState<OrderSummaryResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isActive = true

    const run = async () => {
      if (!orderNo) {
        setSummary(null)
        setErrorMessage('')
        return
      }

      const email = sessionStorage.getItem(ORDER_COMPLETE_EMAIL_STORAGE_KEY)?.trim()

      if (!email) {
        setSummary(null)
        setErrorMessage('查詢資訊已失效，請重新查詢訂單。')
        return
      }

      try {
        setErrorMessage('')
        const result = await fetchOrderSummary(orderNo, email)

        if (!isActive) {
          return
        }

        setSummary(result)
        sessionStorage.removeItem(ORDER_COMPLETE_EMAIL_STORAGE_KEY)
      } catch (error) {
        if (!isActive) {
          return
        }

        setSummary(null)
        setErrorMessage(error instanceof OrderApiError ? error.message : '查詢訂單失敗，請稍後再試。')
      }
    }

    void run()

    return () => {
      isActive = false
    }
  }, [orderNo])

  return (
    <PaymentFlowLayout showBackButton={false}>
      <section className='rounded-xl border border-zinc-200 bg-white p-6 text-center sm:p-8'>
        <p className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700'>
          ✓
        </p>
        <h1 className='mt-4 text-2xl font-bold text-zinc-900'>付款成功</h1>
        <p className='mt-2 text-sm text-zinc-500'>感謝您的訂購，我們已收到您的訂單。</p>
        {orderNo ? (
          <div className='mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700'>
            <p>
              訂單編號：<span className='font-semibold text-zinc-900'>{orderNo}</span>
            </p>
            {summary?.email ? <p className='mt-1 text-xs text-zinc-500'>訂購信箱：{summary.email}</p> : null}
            {errorMessage ? <p className='mt-1 text-xs text-amber-700'>{errorMessage}</p> : null}
          </div>
        ) : null}

        <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center'>
          <Button asChild variant='outline'>
            <Link href='/order/lookup'>查詢訂單</Link>
          </Button>
          <Button asChild>
            <Link href='/'>回到首頁</Link>
          </Button>
        </div>
      </section>
    </PaymentFlowLayout>
  )
}
