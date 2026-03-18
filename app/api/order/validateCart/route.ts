import { postValidateCart } from '@/server/dataSource/orderSource'
import type { CartItem } from '@/shared/hooks/useCart'

type ValidateCartRequestBody = {
  items?: CartItem[]
}

export async function POST(request: Request) {
  const body = (await request.json()) as ValidateCartRequestBody
  const items = body.items ?? []

  if (!Array.isArray(body.items)) {
    return Response.json({ message: 'items is required' }, { status: 400 })
  }

  const result = await postValidateCart(items)
  return Response.json(result)
}
