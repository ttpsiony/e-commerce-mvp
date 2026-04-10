import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { CART_STORAGE_KEY, getCartTotalCount, getCartTotalPrice, useCart, type CartItem } from './useCart'

const makeItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 'P-001',
  name: 'Widget',
  image: '/img.png',
  price: 100,
  originalPrice: 120,
  quantity: 1,
  ...overrides
})

// ─── pure functions ──────────────────────────────────────────────────────────

describe('getCartTotalPrice', () => {
  it('returns 0 for empty cart', () => {
    expect(getCartTotalPrice([])).toBe(0)
  })

  it('calculates price × quantity for a single item', () => {
    expect(getCartTotalPrice([makeItem({ price: 200, quantity: 3 })])).toBe(600)
  })

  it('sums price × quantity across multiple items', () => {
    const items = [
      makeItem({ id: '1', price: 100, quantity: 2 }), // 200
      makeItem({ id: '2', price: 250, quantity: 1 }), // 250
      makeItem({ id: '3', price: 50, quantity: 4 }) // 200
    ]
    expect(getCartTotalPrice(items)).toBe(650)
  })

  it('uses price field, not originalPrice', () => {
    const item = makeItem({ price: 80, originalPrice: 120, quantity: 2 })
    expect(getCartTotalPrice([item])).toBe(160)
  })

  it('handles quantity of 0', () => {
    expect(getCartTotalPrice([makeItem({ price: 500, quantity: 0 })])).toBe(0)
  })
})

describe('getCartTotalCount', () => {
  it('returns 0 for empty cart', () => {
    expect(getCartTotalCount([])).toBe(0)
  })

  it('returns quantity for a single item', () => {
    expect(getCartTotalCount([makeItem({ quantity: 5 })])).toBe(5)
  })

  it('sums quantities across multiple items', () => {
    const items = [
      makeItem({ id: '1', quantity: 2 }),
      makeItem({ id: '2', quantity: 3 }),
      makeItem({ id: '3', quantity: 1 })
    ]
    expect(getCartTotalCount(items)).toBe(6)
  })

  it('handles quantity of 0', () => {
    expect(getCartTotalCount([makeItem({ quantity: 0 })])).toBe(0)
  })
})

// ─── useCart hook ────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.removeItem(CART_STORAGE_KEY)
  const { result } = renderHook(() => useCart())
  act(() => {
    result.current.clearCart()
  })
})

describe('addItem', () => {
  it('adds a new item to the empty cart', () => {
    const { result } = renderHook(() => useCart())
    act(() => {
      result.current.addItem(makeItem())
    })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe('P-001')
  })

  it('defaults quantity to 1 when not provided', () => {
    const { result } = renderHook(() => useCart())
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { quantity: _quantity, ...itemWithoutQty } = makeItem()
    act(() => {
      result.current.addItem(itemWithoutQty)
    })
    expect(result.current.items[0].quantity).toBe(1)
  })

  it('clamps quantity below 1 to 1', () => {
    const { result } = renderHook(() => useCart())
    act(() => {
      result.current.addItem(makeItem({ quantity: 0 }))
    })
    expect(result.current.items[0].quantity).toBe(1)
  })

  it('increments quantity when adding an existing item', () => {
    const { result } = renderHook(() => useCart())
    act(() => {
      result.current.addItem(makeItem({ quantity: 2 }))
      result.current.addItem(makeItem({ quantity: 3 }))
    })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(5)
  })

  it('updates price/name/image when adding an existing item', () => {
    const { result } = renderHook(() => useCart())
    act(() => {
      result.current.addItem(makeItem({ price: 100, name: 'Old Name' }))
      result.current.addItem(makeItem({ price: 80, name: 'New Name', image: '/new.png' }))
    })
    const item = result.current.items[0]
    expect(item.price).toBe(80)
    expect(item.name).toBe('New Name')
    expect(item.image).toBe('/new.png')
  })

  it('keeps different items separate', () => {
    const { result } = renderHook(() => useCart())
    act(() => {
      result.current.addItem(makeItem({ id: 'A' }))
      result.current.addItem(makeItem({ id: 'B' }))
    })
    expect(result.current.items).toHaveLength(2)
  })
})

describe('updateItemQuantity', () => {
  it('updates the quantity of an existing item', () => {
    const { result } = renderHook(() => useCart())
    act(() => {
      result.current.addItem(makeItem({ quantity: 1 }))
      result.current.updateItemQuantity('P-001', 5)
    })
    expect(result.current.items[0].quantity).toBe(5)
  })

  it('removes the item when quantity is set to 0', () => {
    const { result } = renderHook(() => useCart())
    act(() => {
      result.current.addItem(makeItem())
      result.current.updateItemQuantity('P-001', 0)
    })
    expect(result.current.items).toHaveLength(0)
  })

  it('removes the item when quantity is negative (clamped to 0)', () => {
    const { result } = renderHook(() => useCart())
    act(() => {
      result.current.addItem(makeItem())
      result.current.updateItemQuantity('P-001', -3)
    })
    expect(result.current.items).toHaveLength(0)
  })

  it('does not affect other items', () => {
    const { result } = renderHook(() => useCart())
    act(() => {
      result.current.addItem(makeItem({ id: 'A', quantity: 1 }))
      result.current.addItem(makeItem({ id: 'B', quantity: 1 }))
      result.current.updateItemQuantity('A', 10)
    })
    expect(result.current.items.find((i) => i.id === 'B')?.quantity).toBe(1)
  })
})

describe('removeItem', () => {
  it('removes the item with the given id', () => {
    const { result } = renderHook(() => useCart())
    act(() => {
      result.current.addItem(makeItem({ id: 'A' }))
      result.current.addItem(makeItem({ id: 'B' }))
      result.current.removeItem('A')
    })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe('B')
  })

  it('does nothing when removing a non-existent id', () => {
    const { result } = renderHook(() => useCart())
    act(() => {
      result.current.addItem(makeItem())
      result.current.removeItem('DOES_NOT_EXIST')
    })
    expect(result.current.items).toHaveLength(1)
  })
})

describe('clearCart', () => {
  it('empties all items', () => {
    const { result } = renderHook(() => useCart())
    act(() => {
      result.current.addItem(makeItem({ id: 'A' }))
      result.current.addItem(makeItem({ id: 'B' }))
      result.current.clearCart()
    })
    expect(result.current.items).toHaveLength(0)
  })

  it('is idempotent when called on empty cart', () => {
    const { result } = renderHook(() => useCart())
    act(() => {
      result.current.clearCart()
    })
    expect(result.current.items).toHaveLength(0)
  })
})

describe('useCart derived values', () => {
  it('totalPrice sums price × quantity for all items', () => {
    const { result } = renderHook(() => useCart())
    act(() => {
      result.current.addItem(makeItem({ id: 'A', price: 100, quantity: 2 }))
      result.current.addItem(makeItem({ id: 'B', price: 300, quantity: 1 }))
    })
    expect(result.current.totalPrice).toBe(500)
  })

  it('totalCount sums all quantities', () => {
    const { result } = renderHook(() => useCart())
    act(() => {
      result.current.addItem(makeItem({ id: 'A', quantity: 2 }))
      result.current.addItem(makeItem({ id: 'B', quantity: 3 }))
    })
    expect(result.current.totalCount).toBe(5)
  })

  it('totalPrice and totalCount are 0 for empty cart', () => {
    const { result } = renderHook(() => useCart())
    expect(result.current.totalPrice).toBe(0)
    expect(result.current.totalCount).toBe(0)
  })
})
