'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PaymentFlowLayout from '@/components/layout/PaymentFlowLayout'
import { Button } from '@/components/ui/button'
import { useCart } from '@/shared/hooks/useCart'
import { formatCurrency } from '@/shared/utils/currency'

export default function CartPageClient() {
  const router = useRouter()
  const { items, updateItemQuantity, removeItem, totalPrice, totalCount } = useCart()

  return (
    <PaymentFlowLayout showBackButton={false}>
      <div className='mb-6 space-y-1'>
        <h1 className='text-2xl font-bold text-zinc-900 sm:text-3xl'>購物車</h1>
        <p className='text-sm text-zinc-500'>共 {totalCount} 件商品</p>
      </div>

      {items.length === 0 ? (
        <div className='rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center'>
          <p className='mb-4 text-zinc-600'>目前購物車沒有商品</p>
          <Button asChild>
            <Link href='/products'>前往購物列表</Link>
          </Button>
        </div>
      ) : (
        <ul className='space-y-3'>
          {items.map((item) => (
            <li key={item.id} className='flex gap-3 rounded-xl border border-zinc-200 bg-white p-3 sm:p-4'>
              <div className='relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:h-28 sm:w-28'>
                <Image src={item.image} alt={item.name} fill className='object-cover' sizes='112px' />
              </div>

              <div className='flex min-w-0 flex-1 flex-col gap-2'>
                <p className='text-xs text-zinc-500'>ID: {item.id}</p>
                <h2 className='line-clamp-2 font-semibold text-zinc-900'>{item.name}</h2>

                <div className='flex flex-wrap items-center gap-2'>
                  <span className='font-bold text-zinc-900'>{formatCurrency(item.price)}</span>
                  {item.originalPrice > item.price ? (
                    <span className='text-sm text-zinc-400 line-through'>{formatCurrency(item.originalPrice)}</span>
                  ) : null}
                </div>

                <div className='mt-auto flex flex-wrap items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                    aria-label={`減少 ${item.name} 數量`}
                  >
                    -
                  </Button>
                  <span className='min-w-12 text-center text-sm text-zinc-700'>共 {item.quantity} 個</span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                    aria-label={`增加 ${item.name} 數量`}
                  >
                    +
                  </Button>
                  <Button variant='ghost' size='sm' onClick={() => removeItem(item.id)}>
                    移除
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className='fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur'>
        <div className='mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-3'>
          <div>
            <p className='text-xs text-zinc-500'>總價</p>
            <p className='text-lg font-bold text-zinc-900'>{formatCurrency(totalPrice)}</p>
          </div>

          <div className='grid w-full max-w-sm grid-cols-2 gap-2'>
            <Button asChild variant='outline' className='w-full'>
              <Link href='/products'>前往購物列表</Link>
            </Button>
            <Button
              className='w-full'
              disabled={totalCount === 0}
              aria-disabled={totalCount === 0}
              onClick={() => router.push('/checkout')}
            >
              前往購買
            </Button>
          </div>
        </div>
      </div>
    </PaymentFlowLayout>
  )
}
