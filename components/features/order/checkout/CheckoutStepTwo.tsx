'use client'

import ValidationNotice from '@/components/features/order/checkout/ValidationNotice'
import { formatCurrency } from '@/shared/utils/currency'
import type { CartItem, CartValidationResponse, InfoRow } from '@/components/features/order/checkout/types'

type CheckoutStepTwoProps = {
  infoRows: InfoRow[]
  items: CartItem[]
  validation: CartValidationResponse | null
}

export default function CheckoutStepTwo({ infoRows, items, validation }: CheckoutStepTwoProps) {
  return (
    <div className='mb-28'>
      <ValidationNotice validation={validation} />

      <section className='rounded-xl border border-zinc-200 bg-white p-4 sm:p-6'>
        <ul className='mt-1'>
          {infoRows.map((row) => (
            <li key={row.label} className='border-b border-zinc-200 py-3 last:border-b-0'>
              <p className='text-xs font-medium tracking-wide text-zinc-500'>{row.label}</p>
              <p className='mt-1 text-sm text-zinc-800'>{row.value}</p>
            </li>
          ))}
        </ul>

        <h2 className='mt-6 text-lg font-semibold text-zinc-900'>購買商品列表</h2>
        {items.length === 0 ? (
          <p className='mt-3 text-sm text-zinc-500'>目前沒有商品。</p>
        ) : (
          <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-800'>
            {items.map((item) => (
              <li key={item.id} className='flex items-center justify-between gap-3'>
                <span>
                  {item.name} x {item.quantity}
                </span>
                {item.originalPrice > item.price ? (
                  <span className='shrink-0 text-right'>
                    <span className='font-medium text-rose-600'>{formatCurrency(item.price * item.quantity)}</span>
                    <span className='ml-2 text-xs text-zinc-400 line-through'>
                      {formatCurrency(item.originalPrice * item.quantity)}
                    </span>
                  </span>
                ) : (
                  <span className='shrink-0'>{formatCurrency(item.price * item.quantity)}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
