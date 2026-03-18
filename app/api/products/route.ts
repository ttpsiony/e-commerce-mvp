import { NextRequest } from 'next/server'
import { getProducts } from '@/server/dataSource/productSource'

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get('limit')
  const nextParam = request.nextUrl.searchParams.get('next')
  const qParam = request.nextUrl.searchParams.get('q') ?? undefined

  const data = await getProducts({
    limit: limitParam ? Number.parseInt(limitParam, 10) : undefined,
    next: nextParam,
    q: qParam
  })

  return Response.json(data)
}
