import type { CurrencyCode } from '@/shared/utils/currency'

export const languageOptions = [
  { label: '繁體中文', value: 'zh-TW' },
  { label: 'English', value: 'en-US' }
] as const

export const currencyOptions: Array<{
  label: string
  value: CurrencyCode
}> = [{ label: '新台幣 (TWD)', value: 'TWD' }]

export const paymentMethods = [
  { value: 'credit-card', label: '信用卡' },
  { value: 'atm', label: 'ATM 轉帳' },
  { value: 'cod', label: '貨到付款' }
] as const
