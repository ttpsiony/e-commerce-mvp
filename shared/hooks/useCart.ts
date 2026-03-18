'use client'

import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { createJSONStorage, persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  name: string
  image: string
  price: number
  originalPrice: number
  quantity: number
}

type AddCartItemInput = Omit<CartItem, 'quantity'> & {
  quantity?: number
}

type CartState = {
  items: CartItem[]
  addItem: (item: AddCartItemInput) => void
  updateItemQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

export const CART_STORAGE_KEY = 'ecommerce-cart-storage'

const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => {
        const nextQuantity = Math.max(1, item.quantity ?? 1)

        set((state) => {
          const existing = state.items.find((cartItem) => cartItem.id === item.id)
          if (!existing) {
            return {
              items: [
                ...state.items,
                {
                  id: item.id,
                  name: item.name,
                  image: item.image,
                  price: item.price,
                  originalPrice: item.originalPrice,
                  quantity: nextQuantity
                }
              ]
            }
          }

          return {
            items: state.items.map((cartItem) =>
              cartItem.id === item.id
                ? {
                    ...cartItem,
                    quantity: cartItem.quantity + nextQuantity,
                    price: item.price,
                    originalPrice: item.originalPrice,
                    name: item.name,
                    image: item.image
                  }
                : cartItem
            )
          }
        })
      },
      updateItemQuantity: (id, quantity) => {
        const nextQuantity = Math.max(0, quantity)

        set((state) => ({
          items:
            nextQuantity === 0
              ? state.items.filter((item) => item.id !== id)
              : state.items.map((item) => (item.id === id ? { ...item, quantity: nextQuantity } : item))
        }))
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id)
        }))
      },
      clearCart: () => {
        set({ items: [] })
      }
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items
      })
    }
  )
)

export function useCart() {
  const cart = useCartStore(
    useShallow((state) => ({
      items: state.items,
      addItem: state.addItem,
      updateItemQuantity: state.updateItemQuantity,
      removeItem: state.removeItem,
      clearCart: state.clearCart
    }))
  )

  return {
    ...cart,
    totalPrice: getCartTotalPrice(cart.items),
    totalCount: getCartTotalCount(cart.items)
  }
}

export function getCartTotalPrice(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function getCartTotalCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}
