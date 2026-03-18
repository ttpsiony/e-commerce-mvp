export const defaultCurrency = 'TWD' as const
export const defaultLocale = 'zh-TW' as const

export type CurrencyCode = 'TWD' | 'USD' | 'JPY' | 'EUR'

type CurrencyFormatOptions = {
  currency?: CurrencyCode
  locale?: string
  maximumFractionDigits?: number
}

const formatterCache = new Map<string, Intl.NumberFormat>()

function getCurrencyFormatter({
  currency = defaultCurrency,
  locale = defaultLocale,
  maximumFractionDigits = 0
}: CurrencyFormatOptions) {
  const cacheKey = `${locale}|${currency}|${maximumFractionDigits}`
  const cached = formatterCache.get(cacheKey)
  if (cached) return cached

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits
  })
  formatterCache.set(cacheKey, formatter)
  return formatter
}

export function formatCurrency(value: number, options: CurrencyFormatOptions = {}) {
  return getCurrencyFormatter(options).format(value)
}
