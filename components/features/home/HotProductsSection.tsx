import { LinkProductCard, type ProductCardData } from '@/components/common/product/ProductCard'

type HotProductsSectionProps = {
  products: ProductCardData[]
}

export default function HotProductsSection({ products }: HotProductsSectionProps) {
  return (
    <section className='mx-auto w-full max-w-6xl px-4 py-10 sm:py-14' id='products'>
      <div className='mb-6 flex items-end justify-between sm:mb-8'>
        <div>
          <p className='text-sm font-semibold tracking-widest text-zinc-500'>POPULAR PICKS</p>
          <h2 className='mt-1 text-2xl font-bold text-zinc-900 sm:text-3xl'>熱門商品</h2>
        </div>
        <span className='text-sm text-zinc-500'>推薦 4 款</span>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {products.map((product) => (
          <LinkProductCard
            key={product.id}
            product={product}
            href={`/product/${product.id}`}
            ariaLabel={`查看商品「${product.name}」詳細資訊`}
            prefetchTriggers={['hover', 'touch']}
          />
        ))}
      </div>
    </section>
  )
}
