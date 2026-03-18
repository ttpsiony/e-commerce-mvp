'use client'

import dynamic from 'next/dynamic'

const CartPageClient = dynamic(() => import('@/components/features/cart/CartPageClient'))

export default function CartPage() {
  return <CartPageClient />
}
