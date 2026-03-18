import { AxiosError } from 'axios'

export type ErrorType = 'abort' | 'timeout' | 'network' | 'client' | 'server' | 'unknown'

export type NormalizedError = {
  type: ErrorType
  status?: number
  message: string
  details?: unknown
  raw?: unknown
}

export class ApiError extends Error {
  type: ErrorType
  status?: number
  details?: unknown
  raw: unknown

  constructor(normalized: NormalizedError) {
    super(normalized.message)
    this.name = 'ApiError'
    this.type = normalized.type
    this.status = normalized.status
    this.details = normalized.details
    this.raw = normalized.raw
  }
}

export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof ApiError) {
    return {
      type: error.type,
      status: error.status,
      message: error.message,
      details: error.details,
      raw: error.raw
    }
  }

  if (error instanceof AxiosError) {
    if (error.code === 'ERR_CANCELED') {
      return {
        type: 'abort',
        status: 499,
        message: error.message || 'Request canceled',
        details: error.response?.data,
        raw: error
      }
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return {
        type: 'timeout',
        status: error.response?.status,
        message: error.message || 'Request timeout',
        details: error.response?.data,
        raw: error
      }
    }

    if (!error.response || error.code === 'ERR_NETWORK') {
      return {
        type: 'network',
        message: error.message || 'Network error',
        details: error.response?.data,
        raw: error
      }
    }

    const status = error.response.status
    return {
      type: status >= 500 ? 'server' : 'client',
      status,
      message: error.message || `Request failed with status ${status}`,
      details: error.response?.data,
      raw: error
    }
  }

  if (error instanceof Error) {
    return {
      type: 'unknown',
      message: error.message,
      raw: error
    }
  }

  return {
    type: 'unknown',
    message: 'Unknown error',
    raw: error
  }
}
