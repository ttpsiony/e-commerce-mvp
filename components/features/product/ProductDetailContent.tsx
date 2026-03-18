import Image from 'next/image'
import RecommendationProductsSection from '@/components/features/product/RecommendationProductsSection'
import type { ProductDetailData } from '@/components/features/product/api'
import ProductPurchaseBarClient from '@/components/features/product/ProductPurchaseBarClient'
import { formatCurrency } from '@/shared/utils/currency'

type ProductDetailContentProps = {
  product: ProductDetailData
}

export default function ProductDetailContent({ product }: ProductDetailContentProps) {
  const specifications = product.specifications
  const specRows = [
    { label: 'Material', value: specifications?.material },
    { label: 'Size', value: specifications?.size },
    { label: 'Color', value: specifications?.color },
    { label: 'Weight', value: specifications?.weight },
    { label: 'Origin', value: specifications?.origin },
    {
      label: 'Warranty',
      value: specifications?.warrantyMonths ? `${specifications.warrantyMonths} months` : undefined
    }
  ].filter((item) => Boolean(item.value))

  return (
    <>
      <main className='mx-auto w-full max-w-6xl space-y-8 px-4 py-8 pb-28 sm:space-y-10 sm:py-10 sm:pb-32'>
        <section className='grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 lg:grid-cols-2 lg:gap-8'>
          <div className='relative aspect-4/3 w-full overflow-hidden rounded-xl bg-zinc-100'>
            <Image
              src={product?.image ?? '/next.svg'}
              alt={product.name ?? 'Product image'}
              fill
              className='object-cover'
              fetchPriority='high'
              preload={true}
            />
          </div>

          <div className='flex flex-col gap-4'>
            <h1 className='text-2xl font-bold text-zinc-900 sm:text-3xl'>{product.name ?? 'Unnamed Product'}</h1>
            <p className='text-sm text-zinc-500'>Product ID: {product.id}</p>
            <p className='text-zinc-700'>{product.description}</p>

            {product.tags?.length ? (
              <div className='flex flex-wrap gap-2'>
                {product.tags.map((tag) => (
                  <span key={`${product.id}-${tag}`} className='rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600'>
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className='mt-auto flex items-baseline gap-2'>
              <span className='text-2xl font-bold text-zinc-900'>{formatCurrency(product.price ?? 0)}</span>
              {(product.originalPrice ?? 0) > (product.price ?? 0) ? (
                <span className='text-sm text-zinc-400 line-through'>{formatCurrency(product.originalPrice ?? 0)}</span>
              ) : null}
            </div>
          </div>
        </section>

        <section className='space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6'>
          <h2 className='text-xl font-bold text-zinc-900'>商品規格</h2>
          <div className='space-y-2 text-zinc-700'>
            {specRows.map((item) => (
              <p key={item.label}>
                <span className='font-semibold text-zinc-900'>{item.label}:</span> {item.value}
              </p>
            ))}
            {specifications?.features?.length ? (
              <p>
                <span className='font-semibold text-zinc-900'>Features:</span> {specifications.features.join(', ')}
              </p>
            ) : null}
          </div>
        </section>

        <section className='space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6'>
          <h2 className='text-xl font-bold text-zinc-900'>細節</h2>
          <ul className='list-inside list-disc space-y-2 text-zinc-700'>
            {(product.details ?? []).map((detail, index) => (
              <li key={`detail-${index}`}>{detail}</li>
            ))}
          </ul>
        </section>

        <section className='space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6'>
          <h2 className='text-xl font-bold text-zinc-900'>注意事項</h2>
          <ul className='list-inside list-disc space-y-2 text-zinc-700'>
            {(product.precautions ?? []).map((note, index) => (
              <li key={`note-${index}`}>{note}</li>
            ))}
          </ul>
        </section>

        <RecommendationProductsSection productId={product.id} />
      </main>

      <ProductPurchaseBarClient product={product} />
    </>
  )
}
