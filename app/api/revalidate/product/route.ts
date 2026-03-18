import { revalidateTag } from 'next/cache'
import { getProductRevalidateTag } from '@/components/features/product/server-api'

type RevalidateProductPayload = {
  id?: string
  secret?: string
}

function isAuthorized(secret?: string) {
  const expectedSecret = process.env.REVALIDATE_SECRET

  if (!expectedSecret) {
    return true
  }

  return secret === expectedSecret
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as RevalidateProductPayload | null
  const id = payload?.id?.trim()
  const secret = payload?.secret ?? request.headers.get('x-revalidate-secret') ?? undefined

  // 驗證權限
  if (!isAuthorized(secret)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ message: 'Product id is required' }, { status: 400 })
  }

  revalidateTag(getProductRevalidateTag(id), 'max')

  return Response.json({
    revalidated: true,
    id,
    tag: getProductRevalidateTag(id),
    revalidatedAt: new Date().toISOString()
  })
}
