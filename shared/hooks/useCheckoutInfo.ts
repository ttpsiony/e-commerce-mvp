'use client'

import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { createJSONStorage, persist } from 'zustand/middleware'

export type CheckoutInfo = {
  email: string
  name: string
  phoneNumber: string
  address: string
  paymentMethod: string
}

type CheckoutInfoState = CheckoutInfo & {
  hasHydrated: boolean
  setInfo: (payload: CheckoutInfo) => void
  clearInfo: () => void
  setHasHydrated: (hasHydrated: boolean) => void
}

const initialState: CheckoutInfo = {
  email: '',
  name: '',
  phoneNumber: '',
  address: '',
  paymentMethod: ''
}

export const CHECKOUT_INFO_STORAGE_KEY = 'ecommerce-checkout-info-storage'

const useCheckoutInfoStore = create<CheckoutInfoState>()(
  persist(
    (set) => ({
      ...initialState,
      hasHydrated: false,
      setInfo: (payload) => set(payload),
      clearInfo: () => set(initialState),
      setHasHydrated: (hasHydrated) => set({ hasHydrated })
    }),
    {
      name: CHECKOUT_INFO_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        email: state.email,
        name: state.name,
        phoneNumber: state.phoneNumber,
        address: state.address,
        paymentMethod: state.paymentMethod
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          state?.setHasHydrated(true)
        }
      }
    }
  )
)

export function useCheckoutInfo() {
  return useCheckoutInfoStore(
    useShallow((state) => ({
      email: state.email,
      name: state.name,
      phoneNumber: state.phoneNumber,
      address: state.address,
      paymentMethod: state.paymentMethod,
      hasHydrated: state.hasHydrated,
      setInfo: state.setInfo,
      clearInfo: state.clearInfo
    }))
  )
}
