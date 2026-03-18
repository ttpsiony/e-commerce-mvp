import client, { ApiError, type ErrorType } from '@/lib/api/client'
import type {
  ApiErrorResponse,
  CartItem,
  CartValidationResponse,
  CheckoutInfo,
  OrderApiResponse,
  OrderSummaryResponse
} from '@/components/features/order/checkout/types'

export class OrderApiError extends ApiError {
  validation?: CartValidationResponse

  constructor(
    message: string,
    options: {
      type: ErrorType
      status?: number
      validation?: CartValidationResponse
      details?: unknown
      raw?: unknown
    }
  ) {
    super({
      type: options.type,
      status: options.status,
      message,
      details: options.details,
      raw: options.raw
    })
    this.name = 'OrderApiError'
    this.validation = options.validation
  }
}

// feature-level 的錯誤訊息在 UI，保留統一的錯誤
function normalizeOrderError(error: unknown, fallbackMessage: string): OrderApiError {
  if (error instanceof ApiError) {
    const details = error.details as ApiErrorResponse | undefined

    return new OrderApiError(error.message || fallbackMessage, {
      type: error.type,
      status: error.status,
      validation: details?.validation,
      details: error.details,
      raw: error.raw
    })
  }

  return new OrderApiError(fallbackMessage, {
    type: 'unknown' as ErrorType,
    status: undefined,
    validation: undefined,
    details: undefined,
    raw: error
  })
}

export async function validateCart(items: CartItem[]) {
  try {
    return await client.post<CartValidationResponse, { items: CartItem[] }>('/api/order/validateCart', {
      body: { items }
    })
  } catch (error) {
    throw normalizeOrderError(error, '驗證購物車失敗，請稍後再試。')
  }
}

export async function createOrder(items: CartItem[], paymentInfo: CheckoutInfo) {
  try {
    return await client.post<OrderApiResponse, { items: CartItem[]; paymentInfo: CheckoutInfo }>('/api/order', {
      body: {
        items,
        paymentInfo
      }
    })
  } catch (error) {
    throw normalizeOrderError(error, '建立訂單失敗，請稍後再試。')
  }
}

export async function fetchOrderSummary(orderNo: string, email: string) {
  try {
    return await client.get<OrderSummaryResponse>(`/api/order/${encodeURIComponent(orderNo)}`, {
      query: {
        email
      }
    })
  } catch (error) {
    throw normalizeOrderError(error, '查詢訂單失敗，請稍後再試。')
  }
}
