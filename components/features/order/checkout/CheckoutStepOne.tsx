'use client'

import PhoneInput from 'react-phone-number-input'
import type { SubmitEventHandler } from 'react'
import { Controller, type Control, type UseFormRegister } from 'react-hook-form'
import ValidationNotice from '@/components/features/order/checkout/ValidationNotice'
import { Input } from '@/components/ui/input'
import { paymentMethods } from '@/shared/constants'
import { formatCurrency } from '@/shared/utils/currency'
import type { CartItem, CartValidationResponse, CheckoutInfo } from '@/components/features/order/checkout/types'

import 'react-phone-number-input/style.css'

type CheckoutStepOneProps = {
  formId: string
  onSubmitAction: SubmitEventHandler<HTMLFormElement>
  registerAction: UseFormRegister<CheckoutInfo>
  control: Control<CheckoutInfo>
  items: CartItem[]
  totalPrice: number
  validation: CartValidationResponse | null
}

export default function CheckoutStepOne({
  formId,
  onSubmitAction,
  registerAction,
  control,
  items,
  totalPrice,
  validation
}: CheckoutStepOneProps) {
  return (
    <div className='mb-28'>
      <ValidationNotice validation={validation} />

      <div className='grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start'>
        <section className='rounded-xl border border-zinc-200 bg-white p-4 sm:p-6'>
          <h1 className='text-xl font-bold text-zinc-900 sm:text-2xl'>填寫付款資訊</h1>

          <form id={formId} className='mt-5 space-y-4' onSubmit={onSubmitAction}>
            <div className='space-y-1.5'>
              <label htmlFor='email' className='text-sm font-medium text-zinc-800'>
                Email
              </label>
              <Input
                id='email'
                type='email'
                placeholder='name@example.com'
                {...registerAction('email', { required: true })}
              />
            </div>

            <div className='space-y-1.5'>
              <label htmlFor='name' className='text-sm font-medium text-zinc-800'>
                姓名
              </label>
              <Input id='name' placeholder='請輸入收件人姓名' {...registerAction('name', { required: true })} />
            </div>

            <div className='space-y-1.5'>
              <label className='text-sm font-medium text-zinc-800'>聯絡電話</label>
              <Controller
                name='phoneNumber'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <PhoneInput
                    name='phoneNumber'
                    international
                    defaultCountry='TW'
                    countryCallingCodeEditable={false}
                    value={field.value || undefined}
                    onChange={(value) => field.onChange(value ?? '')}
                    className='grid gap-2 sm:grid-cols-[150px_1fr]'
                    countrySelectProps={{
                      className:
                        'h-9 rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
                    }}
                    numberInputProps={{
                      name: field.name,
                      className:
                        'h-9 w-full min-w-0 rounded-md border border-input bg-white px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm'
                    }}
                    placeholder='請輸入電話號碼'
                  />
                )}
              />
            </div>

            <div className='space-y-1.5'>
              <label htmlFor='address' className='text-sm font-medium text-zinc-800'>
                收件地址
              </label>
              <Input
                id='address'
                placeholder='縣市、區域、路名、門牌號碼'
                {...registerAction('address', { required: true })}
              />
            </div>

            <div className='space-y-1.5'>
              <label htmlFor='paymentMethod' className='text-sm font-medium text-zinc-800'>
                付款方式
              </label>
              <select
                id='paymentMethod'
                className='h-9 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
                {...registerAction('paymentMethod', { required: true })}
              >
                <option value='' disabled>
                  請選擇付款方式
                </option>
                {paymentMethods.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </section>

        <aside className='rounded-xl border border-zinc-200 bg-white p-4 sm:p-6'>
          <h2 className='text-lg font-semibold text-zinc-900'>購買清單</h2>

          {items.length === 0 ? (
            <p className='mt-4 text-sm text-zinc-500'>目前沒有商品，請先回購物車加入商品。</p>
          ) : (
            <ul className='mt-4 space-y-3'>
              {items.map((item) => (
                <li key={item.id} className='rounded-lg border border-zinc-200 bg-zinc-50 p-3'>
                  <p className='font-medium text-zinc-900'>{item.name}</p>
                  <div className='mt-1 flex items-center justify-between gap-2 text-sm text-zinc-600'>
                    <span>數量：{item.quantity}</span>
                    {item.originalPrice > item.price ? (
                      <div className='text-right'>
                        <p className='font-medium text-rose-600'>{formatCurrency(item.price * item.quantity)}</p>
                        <p className='text-xs text-zinc-400 line-through'>
                          {formatCurrency(item.originalPrice * item.quantity)}
                        </p>
                      </div>
                    ) : (
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    )}
                  </div>
                  {item.originalPrice > item.price ? (
                    <p className='mt-1 text-xs font-medium text-rose-600'>特價中</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          <div className='mt-4 border-t border-zinc-200 pt-3'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-zinc-500'>總金額</span>
              <span className='font-semibold text-zinc-900'>{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
