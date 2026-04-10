import { describe, it, expect } from 'vitest'
import { formatCurrency } from './currency'

describe('formatCurrency', () => {
  it('formats TWD with default locale (zh-TW) and no decimal', () => {
    const result = formatCurrency(1200)
    expect(result).toContain('1,200')
  })

  it('formats USD with en-US locale', () => {
    const result = formatCurrency(9.99, { currency: 'USD', locale: 'en-US', maximumFractionDigits: 2 })
    expect(result).toContain('9.99')
    expect(result).toContain('$')
  })

  it('formats zero correctly', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })

  it('formats large numbers with thousand separators', () => {
    const result = formatCurrency(1000000)
    expect(result).toContain('1,000,000')
  })

  it('returns consistent results for same value (cache hit)', () => {
    const first = formatCurrency(500)
    const second = formatCurrency(500)
    expect(first).toBe(second)
  })

  it('uses different formatters for different currencies', () => {
    const twd = formatCurrency(100, { currency: 'TWD', locale: 'zh-TW' })
    const usd = formatCurrency(100, { currency: 'USD', locale: 'en-US', maximumFractionDigits: 2 })
    expect(twd).not.toBe(usd)
  })

  it('respects maximumFractionDigits option', () => {
    const result = formatCurrency(9.99, { currency: 'USD', locale: 'en-US', maximumFractionDigits: 0 })
    expect(result).not.toContain('.')
  })
})
