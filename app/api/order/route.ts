import { CartValidationError, postOrder } from '@/server/dataSource/orderSource'
import type { CartItem } from '@/shared/hooks/useCart'
import type { CheckoutInfo } from '@/shared/hooks/useCheckoutInfo'

type CreateOrderRequestBody = {
  items?: CartItem[]
  paymentInfo?: CheckoutInfo & {
    paymentDetails?: Record<string, unknown>
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateOrderRequestBody

  if (!Array.isArray(body.items) || !body.paymentInfo) {
    return Response.json({ message: 'items and paymentInfo are required' }, { status: 400 })
  }

  try {
    const order = await postOrder({
      items: body.items,
      paymentInfo: body.paymentInfo
    })

    return Response.json(order, { status: 201 })
  } catch (error) {
    if (error instanceof CartValidationError) {
      return Response.json({ message: error.message, validation: error.validation }, { status: 409 })
    }

    return Response.json({ message: 'Failed to create order' }, { status: 500 })
  }
}
