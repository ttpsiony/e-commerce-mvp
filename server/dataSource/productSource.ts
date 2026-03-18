import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createApiClient } from '@/lib/api/client'

const DEFAULT_SIZE = 10
const MAX_SIZE = 50

const sleep = async (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

const productClient = createApiClient('https://mock-prodcut-api.example.com')

type ProductSpecifications = {
  material?: string
  size?: string
  color?: string
  weight?: string
  origin?: string
  warrantyMonths?: number
  features?: string[]
}

type Product = {
  id?: string
  name?: string
  description?: string
  image?: string
  state?: string
  price?: number
  originalPrice?: number
  tags?: string[]
  specifications?: ProductSpecifications
  details?: string[]
  precautions?: string[]
}

type ProductsResponse = {
  data: Product[]
  paging: {
    size: number
    next: string | null
    hasNext: boolean
    total: number
  }
}

type GetProductsParams = {
  limit?: number
  next?: string | null
  q?: string
}

type ProductStore = {
  products: Product[]
  indexById: Map<string, number>
}

const productsDbPath = path.join(process.cwd(), 'server', 'db', 'PRODUCTS.json')

const productsStorePromise: Promise<ProductStore> = readFile(productsDbPath, 'utf8').then((raw) => {
  const products = JSON.parse(raw) as Product[]
  const indexById = new Map<string, number>()

  products.forEach((product, index) => {
    if (product.id) {
      indexById.set(product.id, index)
    }
  })

  return { products, indexById }
})

async function getProducts(params: GetProductsParams = {}): Promise<ProductsResponse> {
  await sleep(1000) // 故意的

  const { products, indexById } = await productsStorePromise
  const queryParam = params.q?.trim().toLowerCase() ?? ''
  const nextParam = params.next ?? null

  const limitSize = Number.parseInt(`${params.limit ?? DEFAULT_SIZE}`, 10)
  const requestedSize = Number.isFinite(limitSize) && limitSize > 0 ? Math.min(limitSize, MAX_SIZE) : DEFAULT_SIZE

  const filteredProducts = queryParam
    ? products.filter((product) => {
        const matchedName = product.name?.toLowerCase().includes(queryParam)
        const matchedDescription = product.description?.toLowerCase().includes(queryParam)
        const matchedTag = product.tags?.some((tag) => tag.toLowerCase().includes(queryParam))
        return Boolean(matchedName || matchedDescription || matchedTag)
      })
    : products

  const filteredIndexById = queryParam
    ? filteredProducts.reduce<Map<string, number>>((acc, product, index) => {
        if (product.id) {
          acc.set(product.id, index)
        }
        return acc
      }, new Map<string, number>())
    : indexById

  const total = filteredProducts.length

  let startIndex = 0
  if (nextParam) {
    const cursorIndex = filteredIndexById.get(nextParam)
    if (cursorIndex === undefined) {
      return {
        data: [],
        paging: {
          size: requestedSize,
          next: null,
          hasNext: false,
          total
        }
      }
    }

    startIndex = cursorIndex
  }

  const endIndex = startIndex + requestedSize
  const data = filteredProducts.slice(startIndex, endIndex)
  const hasNext = endIndex < filteredProducts.length
  const next = hasNext ? (filteredProducts[endIndex]?.id ?? null) : null

  return {
    data,
    paging: {
      size: requestedSize,
      next,
      hasNext,
      total
    }
  }
}

async function getProduct(id: string) {
  await sleep(300) // 故意的

  const { products } = await productsStorePromise
  return products.find((product) => product.id === id) ?? null
}

async function getRecommendationByProductId(id: string) {
  await sleep(800) // 故意的

  const { products } = await productsStorePromise

  const candidates = products.filter((product) => product.id && product.id !== id && product.state !== 'INACTIVE')
  const shuffled = [...candidates]

  // Fisher-Yates random
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }

  return shuffled.slice(0, 4)
}

export { productClient, getProducts, getProduct, getRecommendationByProductId }
export type { Product, ProductSpecifications, ProductsResponse, GetProductsParams }
