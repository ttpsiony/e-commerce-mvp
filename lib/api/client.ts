import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { getSiteUrl } from '@/shared/utils/domain'
import { logApiError } from '@/shared/logger'
import { abortManager, type AbortManager } from './abort'
import { ApiError, normalizeError, type ErrorType, type NormalizedError } from './error'

function getDefaultBaseUrl() {
  if (typeof window !== 'undefined') {
    return undefined
  }

  return getSiteUrl()
}

const defaultBaseUrl = getDefaultBaseUrl()

type Primitive = string | number | boolean | null | undefined
type QueryParams = Record<string, Primitive>

type ApiRequestOptions<TBody = unknown> = Omit<AxiosRequestConfig<TBody>, 'url' | 'method' | 'data' | 'params'> & {
  body?: TBody
  query?: QueryParams
  abortKey?: string
}

type ApiClient = {
  get: <TResponse>(path: string, options?: ApiRequestOptions) => Promise<TResponse>
  post: <TResponse, TBody = unknown>(path: string, options?: ApiRequestOptions<TBody>) => Promise<TResponse>
  put: <TResponse, TBody = unknown>(path: string, options?: ApiRequestOptions<TBody>) => Promise<TResponse>
  delete: <TResponse, TBody = unknown>(path: string, options?: ApiRequestOptions<TBody>) => Promise<TResponse>
  abort: AbortManager
}

type RequestConfigWithAbort = InternalAxiosRequestConfig & {
  abortKey?: string
}

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function compactQuery(query?: QueryParams) {
  if (!query) return undefined

  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== null && value !== undefined))
}

function cleanupAbortController(key?: string) {
  if (!key) return
  abortManager.delete(key)
}

function createApiClient(baseURL: string | undefined = defaultBaseUrl): ApiClient {
  const axiosInstance = axios.create({
    baseURL,
    timeout: 10000
  })

  async function request<TResponse, TBody = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    options: ApiRequestOptions<TBody> = {}
  ): Promise<TResponse> {
    const { body, query, abortKey, ...restOptions } = options

    axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (!abortKey) return config

      const controller = abortManager.set(abortKey)
      config.signal = controller.signal
      return config
    })

    axiosInstance.interceptors.response.use(
      (response) => {
        cleanupAbortController(abortKey)
        return response
      },
      (error) => {
        cleanupAbortController(abortKey)
        return Promise.reject(error)
      }
    )

    try {
      const response = await axiosInstance.request<TResponse, { data: TResponse }, TBody>({
        method,
        url: normalizePath(path),
        data: body,
        params: compactQuery(query),
        ...restOptions
      })

      return response.data
    } catch (error) {
      const normalized = normalizeError(error)
      logApiError(normalized, `API Error [${method} ${normalizePath(path)}]`)

      throw new ApiError(normalized)
    }
  }

  return {
    get: <TResponse>(path: string, options?: ApiRequestOptions) => request<TResponse>('GET', path, options),
    post: <TResponse, TBody = unknown>(path: string, options?: ApiRequestOptions<TBody>) =>
      request<TResponse, TBody>('POST', path, options),
    put: <TResponse, TBody = unknown>(path: string, options?: ApiRequestOptions<TBody>) =>
      request<TResponse, TBody>('PUT', path, options),
    delete: <TResponse, TBody = unknown>(path: string, options?: ApiRequestOptions<TBody>) =>
      request<TResponse, TBody>('DELETE', path, options),
    abort: abortManager
  }
}

const client = createApiClient(defaultBaseUrl)

export {
  defaultBaseUrl,
  createApiClient,
  client as default,
  ApiError,
  logApiError,
  normalizeError,
  type ApiClient,
  type ApiRequestOptions,
  type ErrorType,
  type NormalizedError,
  type RequestConfigWithAbort
}
