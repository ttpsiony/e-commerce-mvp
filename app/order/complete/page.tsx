'use client'

import dynamic from 'next/dynamic'

const CompletePageClient = dynamic(() => import('@/components/features/order/CompletePageClient'), {
  ssr: false
})

export default function Page() {
  return <CompletePageClient />
}
