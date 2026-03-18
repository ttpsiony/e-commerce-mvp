import { getProduct } from '@/server/dataSource/productSource'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const product = await getProduct(id)

  if (!product) {
    return Response.json({ message: 'Product not found' }, { status: 404 })
  }

  return Response.json({
    id: product.id ?? id,
    name: product.name ?? 'Unnamed Product',
    description: product.description ?? '',
    image: product.image ?? '',
    state: product.state ?? 'ACTIVE',
    price: product.price ?? 0,
    originalPrice: product.originalPrice ?? product.price ?? 0,
    tags: product.tags ?? [],
    specifications: product.specifications,
    details: product.details ?? [],
    precautions: product.precautions ?? []
  })
}
