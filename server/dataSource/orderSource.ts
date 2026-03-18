import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createApiClient } from '@/lib/api/client'
import type { CartItem } from '@/shared/hooks/useCart'
import type { CheckoutInfo } from '@/shared/hooks/useCheckoutInfo'

const sleep = async (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

const orderClient = createApiClient('https://mock-order-api.example.com')

type ProductStockRecord = {
  id: string
  name?: string
  state?: string
  stock?: number
  price?: number
  originalPrice?: number
  image?: string
}

type CartProductSnapshot = {
  id: string
  name: string
  image: string
  price: number
  originalPrice: number
  state: string
  stock: number
}

type ValidateCartItemResult = {
  id: string
  name: string
  requestedQuantity: number
  availableStock: number
  isSellable: boolean
  hasInsufficientStock: boolean
  hasDataChanged: boolean
  isUnavailable: boolean
  status: 'SELLABLE' | 'INSUFFICIENT_STOCK' | 'PRODUCT_UPDATED' | 'UNAVAILABLE' | 'PRODUCT_NOT_FOUND'
  messages: string[]
  product: CartProductSnapshot | null
}

type ValidateCartResponse = {
  isValid: boolean
  hasInsufficientStock: boolean
  hasDataChanged: boolean
  hasUnavailableItems: boolean
  items: ValidateCartItemResult[]
}

type OrderPaymentInfo = CheckoutInfo & {
  paymentDetails?: Record<string, unknown>
}

type PostOrderParams = {
  items: CartItem[]
  paymentInfo: OrderPaymentInfo
}

type OrderRecord = {
  orderNumber: string
  email: string
  createdAt: string
  items: CartItem[]
  paymentInfo: OrderPaymentInfo
  totalPrice: number
}

type GetOrderParams = {
  email: string
  orderNumber: string
}

const productsDbPath = path.join(process.cwd(), 'server', 'db', 'PRODUCTS.json')
const ordersDbPath = path.join(process.cwd(), 'server', 'db', 'ORDER.json')

let orderWriteQueue = Promise.resolve()
let productWriteQueue = Promise.resolve()

async function readProducts() {
  const raw = await readFile(productsDbPath, 'utf8')
  return JSON.parse(raw) as ProductStockRecord[]
}

function writeProducts(products: ProductStockRecord[]) {
  productWriteQueue = productWriteQueue.then(async () => {
    await writeFile(productsDbPath, `${JSON.stringify(products, null, 2)}\n`, 'utf8')
  })

  return productWriteQueue
}

async function ensureOrdersDb() {
  await mkdir(path.dirname(ordersDbPath), { recursive: true })

  try {
    await readFile(ordersDbPath, 'utf8')
  } catch {
    await writeFile(ordersDbPath, '[]\n', 'utf8')
  }
}

async function readOrders() {
  await ensureOrdersDb()
  const raw = await readFile(ordersDbPath, 'utf8')
  return JSON.parse(raw) as OrderRecord[]
}

function writeOrders(orders: OrderRecord[]) {
  orderWriteQueue = orderWriteQueue.then(async () => {
    await ensureOrdersDb()
    await writeFile(ordersDbPath, `${JSON.stringify(orders, null, 2)}\n`, 'utf8')
  })

  return orderWriteQueue
}

function getCartTotalPrice(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

function getAvailableStock(product: ProductStockRecord) {
  if (typeof product.stock === 'number' && Number.isFinite(product.stock)) {
    return Math.max(0, product.stock)
  }

  return 0
}

function buildProductSnapshot(product: ProductStockRecord): CartProductSnapshot {
  return {
    id: product.id,
    name: product.name ?? '',
    image: product.image ?? '',
    price: product.price ?? 0,
    originalPrice: product.originalPrice ?? product.price ?? 0,
    state: product.state ?? 'SOLD_OUT',
    stock: getAvailableStock(product)
  }
}

function buildValidateResult(item: CartItem, productsMap: Map<string, ProductStockRecord>): ValidateCartItemResult {
  const product = productsMap.get(item.id)

  if (!product) {
    return {
      id: item.id,
      name: item.name,
      requestedQuantity: item.quantity,
      availableStock: 0,
      isSellable: false,
      hasInsufficientStock: false,
      hasDataChanged: false,
      isUnavailable: true,
      status: 'PRODUCT_NOT_FOUND',
      messages: ['商品不存在'],
      product: null
    }
  }

  const snapshot = buildProductSnapshot(product)
  const availableStock = getAvailableStock(product)
  const hasInsufficientStock = item.quantity <= 0 || availableStock < item.quantity
  const hasDataChanged =
    item.name !== snapshot.name ||
    item.image !== snapshot.image ||
    item.price !== snapshot.price ||
    item.originalPrice !== snapshot.originalPrice
  const isUnavailable = snapshot.state !== 'ACTIVE'
  const isSellable = !hasInsufficientStock && !hasDataChanged && !isUnavailable
  const messages: string[] = []

  if (hasInsufficientStock) {
    messages.push('庫存不足')
  }

  if (hasDataChanged) {
    messages.push('商品資料已更新')
  }

  if (isUnavailable) {
    messages.push('商品已下架或未販售')
  }

  if (messages.length === 0) {
    messages.push('商品可販售')
  }

  let status: ValidateCartItemResult['status'] = 'SELLABLE'
  if (isUnavailable) {
    status = 'UNAVAILABLE'
  } else if (hasInsufficientStock) {
    status = 'INSUFFICIENT_STOCK'
  } else if (hasDataChanged) {
    status = 'PRODUCT_UPDATED'
  }

  return {
    id: item.id,
    name: snapshot.name || item.name,
    requestedQuantity: item.quantity,
    availableStock,
    isSellable,
    hasInsufficientStock,
    hasDataChanged,
    isUnavailable,
    status,
    messages,
    product: snapshot
  }
}

function createOrderNumber(existingOrders: OrderRecord[]) {
  const maxSequence = existingOrders.reduce((max, order) => {
    const matched = order.orderNumber.match(/ORD-(\d{6})$/)
    if (!matched) {
      return max
    }

    return Math.max(max, Number.parseInt(matched[1], 10))
  }, 0)

  return `ORD-${String(maxSequence + 1).padStart(6, '0')}`
}

async function postValidateCart(items: CartItem[]): Promise<ValidateCartResponse> {
  await sleep(500) // 故意的

  if (items.length === 0) {
    return {
      isValid: false,
      hasInsufficientStock: false,
      hasDataChanged: false,
      hasUnavailableItems: false,
      items: []
    }
  }

  const products = await readProducts()
  const productsMap = new Map(products.filter((product) => Boolean(product.id)).map((product) => [product.id, product]))
  const resultItems = items.map((item) => buildValidateResult(item, productsMap))

  return {
    isValid: resultItems.every((item) => item.isSellable),
    hasInsufficientStock: resultItems.some((item) => item.hasInsufficientStock),
    hasDataChanged: resultItems.some((item) => item.hasDataChanged),
    hasUnavailableItems: resultItems.some((item) => item.isUnavailable),
    items: resultItems
  }
}

class CartValidationError extends Error {
  validation: ValidateCartResponse

  constructor(validation: ValidateCartResponse) {
    super('Cart validation failed')
    this.name = 'CartValidationError'
    this.validation = validation
  }
}

async function postOrder({ items, paymentInfo }: PostOrderParams): Promise<OrderRecord> {
  await sleep(800) // 故意的

  const validation = await postValidateCart(items)
  if (!validation.isValid) {
    throw new CartValidationError(validation)
  }

  const products = await readProducts()
  const nextProducts = products.map((product) => {
    const orderedItem = items.find((item) => item.id === product.id)
    if (!orderedItem) {
      return product
    }

    const nextStock = Math.max(0, getAvailableStock(product) - orderedItem.quantity)

    return {
      ...product,
      stock: nextStock,
      state: nextStock > 0 ? 'ACTIVE' : 'SOLD_OUT'
    }
  })

  const orders = await readOrders()
  const order: OrderRecord = {
    orderNumber: createOrderNumber(orders),
    email: paymentInfo.email,
    createdAt: new Date().toISOString(),
    items,
    paymentInfo,
    totalPrice: getCartTotalPrice(items)
  }

  await writeProducts(nextProducts)
  await writeOrders([...orders, order])

  return order
}

async function getOrder({ email, orderNumber }: GetOrderParams): Promise<OrderRecord | null> {
  await sleep(300) // 故意的

  const orders = await readOrders()

  return (
    orders.find(
      (order) => order.orderNumber === orderNumber && order.email.trim().toLowerCase() === email.trim().toLowerCase()
    ) ?? null
  )
}

async function getOrderByNumber(orderNumber: string): Promise<OrderRecord | null> {
  await sleep(300) // 故意的

  const orders = await readOrders()

  return orders.find((order) => order.orderNumber === orderNumber) ?? null
}

export { CartValidationError, orderClient, postValidateCart, postOrder, getOrder, getOrderByNumber }
export type {
  CartProductSnapshot,
  ValidateCartItemResult,
  ValidateCartResponse,
  OrderPaymentInfo,
  PostOrderParams,
  OrderRecord,
  GetOrderParams
}
