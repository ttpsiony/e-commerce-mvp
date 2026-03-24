'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createOrder, OrderApiError, validateCart } from '@/components/features/order/api'
import { CHECKOUT_INFO_FORM_ID, ORDER_COMPLETE_EMAIL_STORAGE_KEY } from '@/components/features/order/constants'
import PaymentFlowLayout from '@/components/layout/PaymentFlowLayout'
import PaymentProgressSteps from '@/components/features/order/PaymentProgressSteps'
import { Button } from '@/components/ui/button'
import { paymentMethods } from '@/shared/constants'
import { CART_STORAGE_KEY, useCart } from '@/shared/hooks/useCart'
import { CHECKOUT_INFO_STORAGE_KEY, type CheckoutInfo, useCheckoutInfo } from '@/shared/hooks/useCheckoutInfo'
import type { CartValidationResponse, Step } from '@/components/features/order/checkout/types'

const CheckoutStepOne = dynamic(() => import('@/components/features/order/checkout/CheckoutStepOne'), { ssr: false })
const CheckoutStepTwo = dynamic(() => import('@/components/features/order/checkout/CheckoutStepTwo'), { ssr: false })
const CheckoutStepThree = dynamic(() => import('@/components/features/order/checkout/CheckoutStepThree'), {
  ssr: false
})

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const { email, name, phoneNumber, address, paymentMethod, hasHydrated, setInfo, clearInfo } = useCheckoutInfo()
  const { control, getValues, handleSubmit, register, trigger, watch } = useForm<CheckoutInfo>({
    defaultValues: {
      email,
      name,
      phoneNumber,
      address,
      paymentMethod
    },
    values: hasHydrated
      ? {
          email,
          name,
          phoneNumber,
          address,
          paymentMethod
        }
      : undefined
  })

  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)
  const [isValidatingCart, setIsValidatingCart] = useState(false)
  const [validationResult, setValidationResult] = useState<CartValidationResponse | null>(null)
  const [submitMessage, setSubmitMessage] = useState('')

  const saveCheckoutInfo = () => {
    setInfo(getValues())
  }

  const handleNextFromInfo = async () => {
    const isFormValid = await trigger()
    if (!isFormValid) {
      return
    }

    setSubmitMessage('')
    setIsValidatingCart(true)

    try {
      const validation = await validateCart(items)
      setValidationResult(validation)

      if (!validation.isValid) {
        return
      }

      saveCheckoutInfo()
      setCurrentStep(2)
    } catch (error) {
      setSubmitMessage(error instanceof OrderApiError ? error.message : '驗證購物車失敗，請稍後再試。')
    } finally {
      setIsValidatingCart(false)
    }
  }

  const handleNextFromConfirm = async () => {
    if (items.length === 0 || isSubmittingPayment) {
      return
    }

    saveCheckoutInfo()
    setSubmitMessage('')
    setIsSubmittingPayment(true)
    setCurrentStep(3)

    try {
      const data = await createOrder(items, getValues())
      try {
        sessionStorage.setItem(ORDER_COMPLETE_EMAIL_STORAGE_KEY, getValues('email'))
      } catch {
        // storage unavailable (e.g. incognito mode)
      }

      clearCart()
      clearInfo()
      try {
        localStorage.removeItem(CART_STORAGE_KEY)
        localStorage.removeItem(CHECKOUT_INFO_STORAGE_KEY)
      } catch {
        // storage unavailable (e.g. incognito mode)
      }
      router.replace(`/order/complete?orderNo=${encodeURIComponent(data.orderNumber)}`)
    } catch (error) {
      if (error instanceof OrderApiError && error.status === 409) {
        if (error.validation) {
          setValidationResult(error.validation)
          setCurrentStep(2)
          setSubmitMessage('購物車內容已變動，請確認後再重新送出訂單。')
          return
        }
      }

      setCurrentStep(2)
      setSubmitMessage(error instanceof OrderApiError ? error.message : '建立訂單失敗，請稍後再試。')
    } finally {
      setIsSubmittingPayment(false)
    }
  }

  const isBusy = isValidatingCart || isSubmittingPayment
  const isCartEmpty = items.length === 0

  const handlePreviousStep = () => {
    if (isBusy) {
      return
    }

    setSubmitMessage('')
    setCurrentStep((prev) => (prev === 1 ? prev : ((prev - 1) as Step)))
  }
  const activeValidationResult = isCartEmpty ? null : validationResult
  const activeSubmitMessage = isCartEmpty ? '' : submitMessage

  const formValues = watch()
  const paymentLabel = useMemo(
    () => paymentMethods.find((item) => item.value === formValues.paymentMethod)?.label ?? '未選擇',
    [formValues.paymentMethod]
  )
  const infoRows = useMemo(
    () => [
      { label: 'Email', value: formValues.email || '未填寫' },
      { label: '姓名', value: formValues.name || '未填寫' },
      { label: '聯絡電話', value: formValues.phoneNumber || '未填寫' },
      { label: '收件地址', value: formValues.address || '未填寫' },
      { label: '付款方式', value: paymentLabel }
    ],
    [formValues.email, formValues.name, formValues.phoneNumber, formValues.address, paymentLabel]
  )

  if (!hasHydrated) {
    return (
      <PaymentFlowLayout showBackButton={false}>
        <PaymentProgressSteps currentStep={1} />
        <section className='mb-28 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6'>
          <p className='text-sm text-zinc-600'>載入結帳資訊中...</p>
        </section>
      </PaymentFlowLayout>
    )
  }

  return (
    <PaymentFlowLayout showBackButton={false}>
      <PaymentProgressSteps currentStep={currentStep} />

      {activeSubmitMessage ? (
        <section className='mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800'>
          {activeSubmitMessage}
        </section>
      ) : null}

      {currentStep === 1 ? (
        <CheckoutStepOne
          formId={CHECKOUT_INFO_FORM_ID}
          onSubmitAction={(event) => void handleSubmit(handleNextFromInfo)(event)}
          registerAction={register}
          control={control}
          items={items}
          totalPrice={totalPrice}
          validation={activeValidationResult}
        />
      ) : null}

      {currentStep === 2 ? (
        <CheckoutStepTwo infoRows={infoRows} items={items} validation={activeValidationResult} />
      ) : null}

      {currentStep === 3 ? <CheckoutStepThree /> : null}

      <div className='fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur'>
        <div className='mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-3'>
          {currentStep === 1 ? (
            <Button asChild variant='outline'>
              <Link href='/cart'>回購物車</Link>
            </Button>
          ) : (
            <Button variant='outline' disabled={isBusy} onClick={handlePreviousStep}>
              回上一步
            </Button>
          )}

          {currentStep === 1 ? (
            <Button form={CHECKOUT_INFO_FORM_ID} type='submit' disabled={items.length === 0 || isValidatingCart}>
              {isValidatingCart ? '驗證中...' : '下一步'}
            </Button>
          ) : null}

          {currentStep === 2 ? (
            <Button disabled={items.length === 0 || isSubmittingPayment} onClick={handleNextFromConfirm}>
              {isSubmittingPayment ? '送出中...' : '確認送出'}
            </Button>
          ) : null}
        </div>
      </div>
    </PaymentFlowLayout>
  )
}
