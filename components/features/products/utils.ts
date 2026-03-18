import { type ProductCardData } from '@/components/common/product/ProductCard'

export function normalizeProducts(products: ProductCardData[]) {
  const productMap = new Map(products.map((product) => [product.id, product]))
  return [...productMap.values()]
}

export function upsertProducts(currentProducts: ProductCardData[], incomingProducts: ProductCardData[]) {
  const nextProducts = [...currentProducts]
  const productIndexMap = new Map(currentProducts.map((product, index) => [product.id, index]))

  for (const product of incomingProducts) {
    const existingIndex = productIndexMap.get(product.id)
    if (existingIndex === undefined) {
      productIndexMap.set(product.id, nextProducts.length)
      nextProducts.push(product)
      continue
    }

    nextProducts[existingIndex] = product
  }

  return nextProducts
}
