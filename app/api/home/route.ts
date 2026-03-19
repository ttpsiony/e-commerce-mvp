import { fetchHomePageData } from '@/components/features/home/server-api'

export async function GET() {
  return Response.json(await fetchHomePageData())
}
