import { getRecommendationByProductId } from '@/server/dataSource/productSource'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const recommendations = await getRecommendationByProductId(id)

  return Response.json({
    data: recommendations
      .filter((item): item is typeof item & { id: string } => Boolean(item.id))
      .map((item) => ({
        id: item.id,
        name: item.name ?? 'Unnamed Product',
        description: item.description ?? '',
        image: item.image ?? '',
        state: item.state ?? 'ACTIVE',
        price: item.price ?? 0,
        originalPrice: item.originalPrice ?? item.price ?? 0,
        tags: item.tags ?? []
      }))
  })
}
