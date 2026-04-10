import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill: _fill, ...rest } = props
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react')
    return React.createElement('img', rest)
  }
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}))
