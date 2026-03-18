import ProductListClient from '@/components/features/products/ProductListClient'
import { fetchProductsForSSR } from '@/components/features/products/server-api'

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string | string[]
  }>
}

export default async function ProductListPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams
  const rawQuery = resolvedSearchParams.q
  const q = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery)?.trim() || undefined
  const initialProducts = await fetchProductsForSSR(q)
  // 處理 lighthouse LCP
  const firstImage = initialProducts.data[0]?.image

  return (
    <>
      {firstImage ? <link rel='preload' as='image' href={firstImage} fetchPriority='high' /> : null}

      <main className='min-h-screen bg-zinc-50 font-sans'>
        <ProductListClient
          initialData={initialProducts.data}
          initialPaging={initialProducts.paging}
          initialKeyword={q}
        />
      </main>
    </>
  )
}
