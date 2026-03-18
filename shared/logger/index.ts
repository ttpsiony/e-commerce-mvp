import type { NormalizedError } from '@/lib/api/error'

type LogContext = {
  label?: string
}

// Log the error to an error reporting service
function logError(error: unknown, context: LogContext = {}): void {
  const { label = 'Error' } = context
  console.error(label, error)
}

function logApiError(error: NormalizedError, label = 'API Error'): void {
  logError(error, { label })
}

export { logApiError, logError }
