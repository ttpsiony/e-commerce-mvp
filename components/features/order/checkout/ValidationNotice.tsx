'use client'

import type { CartValidationResponse } from '@/components/features/order/checkout/types'

export default function ValidationNotice({ validation }: { validation: CartValidationResponse | null }) {
  if (!validation || validation.isValid) {
    return null
  }

  const invalidItems = validation.items.filter((item) => item.status !== 'SELLABLE')

  return (
    <section className='mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4'>
      <h2 className='text-sm font-semibold text-rose-700'>購物車內容需要更新後才能繼續結帳</h2>
      <ul className='mt-3 space-y-3 text-sm text-rose-700'>
        {invalidItems.map((item) => (
          <li key={item.id} className='rounded-lg border border-rose-100 bg-white px-3 py-2'>
            <p className='font-medium'>{item.name}</p>
            <p className='mt-1 text-xs'>{item.messages.join(' / ')}</p>
          </li>
        ))}
      </ul>
      <p className='mt-3 text-xs text-rose-600'>請回購物車調整商品後再重新驗證。</p>
    </section>
  )
}
