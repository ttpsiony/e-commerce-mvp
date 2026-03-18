import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import ProductDetailContent from '@/components/features/product/ProductDetailContent'
import { fetchProductForISR } from '@/components/features/product/server-api'
import { getSiteUrl } from '@/shared/utils/domain'

type ProductPageProps = {
  params: Promise<{
    id: string
  }>
}

export const revalidate = 600

const getProductCached = cache(async (id: string) => await fetchProductForISR(id))

const availabilityMap: Record<string, string> = {
  ACTIVE: 'https://schema.org/InStock',
  SOLD_OUT: 'https://schema.org/OutOfStock',
  INACTIVE: 'https://schema.org/Discontinued'
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  let product

  try {
    product = await getProductCached(id)
  } catch {
    return {
      title: 'Product Error',
      description: 'There was a problem loading the requested product.',
      robots: {
        index: false,
        follow: false
      }
    }
  }

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
      robots: {
        index: false,
        follow: false
      }
    }
  }

  const siteUrl = getSiteUrl()
  const productUrl = `${siteUrl}/product/${id}`
  const title = `${product.name ?? 'Product'} | 商品詳情`
  const description = product.description?.slice(0, 160) || `查看 ${product.name ?? '商品'} 的規格、細節與價格資訊。`

  return {
    title,
    description,
    alternates: {
      canonical: productUrl
    },
    openGraph: {
      type: 'website',
      url: productUrl,
      title,
      description,
      images: product.image
        ? [
            {
              url: product.image,
              alt: product.name ?? 'Product image'
            }
          ]
        : undefined
    }
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProductCached(id)

  if (!product) {
    notFound()
  }

  const siteUrl = getSiteUrl()
  const productUrl = `${siteUrl}/product/${id}`
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name ?? 'Unnamed Product',
    image: product.image ? [product.image] : undefined,
    description: product.description ?? '',
    sku: product.id,
    category: product.tags?.join(', '),
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'TWD',
      price: `${product.price ?? 0}`,
      availability: availabilityMap?.[product?.state] ?? availabilityMap.ACTIVE
    }
  }

  return (
    <>
      {/* // Document: https://nextjs.org/docs/app/guides/json-ld */}
      <link rel='canonical' href={productUrl} />
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <link
        rel='prefetch'
        as='fetch'
        href={`/api/product/${encodeURIComponent(id)}/recommendations`}
        crossOrigin='anonymous'
      />

      <ProductDetailContent product={product} />
    </>
  )
}
