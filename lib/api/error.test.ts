import { AxiosError } from 'axios'
import { describe, it, expect } from 'vitest'
import { ApiError, normalizeError } from './error'

describe('normalizeError', () => {
  it('passes through an existing ApiError unchanged', () => {
    const api = new ApiError({ type: 'timeout', message: 'timed out', status: 408 })
    const result = normalizeError(api)
    expect(result.type).toBe('timeout')
    expect(result.status).toBe(408)
    expect(result.message).toBe('timed out')
  })

  it('returns type "abort" and status 499 for ERR_CANCELED AxiosError', () => {
    const err = new AxiosError('canceled', 'ERR_CANCELED')
    const result = normalizeError(err)
    expect(result.type).toBe('abort')
    expect(result.status).toBe(499)
    expect(result.message).toBe('canceled')
  })

  it('returns type "timeout" for ECONNABORTED AxiosError', () => {
    const err = new AxiosError('timeout exceeded', 'ECONNABORTED')
    const result = normalizeError(err)
    expect(result.type).toBe('timeout')
  })

  it('returns type "timeout" for ETIMEDOUT AxiosError', () => {
    const err = new AxiosError('timed out', 'ETIMEDOUT')
    const result = normalizeError(err)
    expect(result.type).toBe('timeout')
  })

  it('returns type "network" for ERR_NETWORK AxiosError', () => {
    const err = new AxiosError('network error', 'ERR_NETWORK')
    const result = normalizeError(err)
    expect(result.type).toBe('network')
    expect(result.status).toBeUndefined()
  })

  it('returns type "network" for AxiosError with no response', () => {
    const err = new AxiosError('no response')
    // response is undefined by default
    const result = normalizeError(err)
    expect(result.type).toBe('network')
  })

  it('returns type "client" for 4xx status', () => {
    const err = new AxiosError('not found')
    Object.defineProperty(err, 'response', {
      value: { status: 404, data: { message: 'not found' } },
      writable: true
    })
    const result = normalizeError(err)
    expect(result.type).toBe('client')
    expect(result.status).toBe(404)
    expect(result.details).toEqual({ message: 'not found' })
  })

  it('returns type "server" for 5xx status', () => {
    const err = new AxiosError('server error')
    Object.defineProperty(err, 'response', {
      value: { status: 500, data: {} },
      writable: true
    })
    const result = normalizeError(err)
    expect(result.type).toBe('server')
    expect(result.status).toBe(500)
  })

  it('returns type "unknown" for a plain Error', () => {
    const result = normalizeError(new Error('boom'))
    expect(result.type).toBe('unknown')
    expect(result.message).toBe('boom')
  })

  it('returns type "unknown" with fallback message for non-Error values', () => {
    expect(normalizeError(null).type).toBe('unknown')
    expect(normalizeError(null).message).toBe('Unknown error')
    expect(normalizeError(42).type).toBe('unknown')
    expect(normalizeError('string').type).toBe('unknown')
  })
})

describe('ApiError', () => {
  it('inherits from Error with correct name and properties', () => {
    const err = new ApiError({ type: 'server', message: 'fail', status: 503, details: { info: 1 } })
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('ApiError')
    expect(err.type).toBe('server')
    expect(err.status).toBe(503)
    expect(err.details).toEqual({ info: 1 })
    expect(err.message).toBe('fail')
  })
})
