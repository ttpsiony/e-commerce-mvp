import { getOrder } from '@/server/dataSource/orderSource'

type RouteContext = {
  params: Promise<{
    orderNo: string
  }>
}

export async function GET(request: Request, context: RouteContext) {
  const { orderNo } = await context.params
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')?.trim()

  if (!email) {
    return Response.json({ message: 'email is required' }, { status: 400 })
  }

  const order = await getOrder({
    email,
    orderNumber: orderNo
  })

  if (!order) {
    return Response.json({ message: 'Order not found' }, { status: 404 })
  }

  const [name, domain] = order.email.split('@')
  const maskedName = !name ? '' : `${name.slice(0, 2)}${'*'.repeat(Math.max(name.length - 2, 1))}`
  const maskedEmail = domain ? `${maskedName}@${domain}` : maskedName

  return Response.json({
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    totalPrice: order.totalPrice,
    email: maskedEmail
  })
}
