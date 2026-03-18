'use client'

export default function CheckoutStepThree() {
  return (
    <section className='mb-28 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6'>
      <div className='mt-1 flex items-center gap-3 text-zinc-700'>
        <span className='inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900' />
        <p className='text-sm'>付款處理中，請稍候...</p>
      </div>
    </section>
  )
}
