import type { CartItem } from '@/shared/hooks/useCart'
import type { CheckoutInfo } from '@/shared/hooks/useCheckoutInfo'

type Step = 1 | 2 | 3
type InfoRow = { label: string; value: string }

type CartValidationItem = {
  id: string
  name: string
  status: 'SELLABLE' | 'INSUFFICIENT_STOCK' | 'PRODUCT_UPDATED' | 'UNAVAILABLE' | 'PRODUCT_NOT_FOUND'
  messages: string[]
}

type CartValidationResponse = {
  isValid: boolean
  items: CartValidationItem[]
}

type OrderApiResponse = {
  orderNumber: string
}

type OrderSummaryResponse = {
  orderNumber: string
  createdAt: string
  totalPrice: number
  email: string
}

type ApiErrorResponse = {
  message?: string
  validation?: CartValidationResponse
}

export type {
  Step,
  InfoRow,
  CartValidationItem,
  CartValidationResponse,
  OrderApiResponse,
  OrderSummaryResponse,
  ApiErrorResponse,
  CartItem,
  CheckoutInfo
}
