/**
 * Shared HTTP retry logic for integration API clients.
 *
 * All integration clients share identical retry semantics:
 * - GET requests retry on 429 / 500 / 502 / 503 / 504 and network errors.
 * - Mutating requests (POST / PUT / DELETE) only retry on 429 (rate-limit).
 * - Exponential backoff capped at 2 000 ms, up to 3 attempts.
 * - Per-request timeout with AbortController.
 */

/** Status codes safe to retry for idempotent (GET) requests. */
export const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

/** Status codes safe to retry for mutating (POST/PUT/DELETE) requests. */
export const SAFE_RETRY_STATUSES_FOR_MUTATING = new Set([429]);

/** Default maximum number of request attempts. */
export const DEFAULT_MAX_REQUEST_ATTEMPTS = 3;

/** Default per-request timeout in milliseconds. */
export const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

/**
 * Returns exponential-backoff delay for the given attempt, capped at 2 000 ms.
 *
 * Attempt 1 → 250 ms, attempt 2 → 500 ms, attempt 3+ → 2 000 ms.
 */
export function backoffMs(attempt: number): number {
  return Math.min(2000, 250 * 2 ** (attempt - 1));
}

/** Promise-based sleep. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Options for {@link requestWithRetry} and {@link requestResponseWithRetry}.
 */
export interface RequestWithRetryOptions {
  /** HTTP method — determines whether the request is treated as idempotent. */
  method?: string;
  /** Maximum number of attempts (default: 3). */
  maxAttempts?: number;
  /** Per-request timeout in milliseconds (default: 30 000). */
  timeoutMs?: number;
  /** Whether to include the response body in thrown errors (default: true). */
  includeBodyInError?: boolean;
  /**
   * Factory that turns a failed HTTP response into an error instance.
   * If not provided, a generic `Error` is thrown.
   */
  createError?: (message: string, status: number, responseBody: string) => Error & { status: number };
  /**
   * Whether the request is semantically idempotent, regardless of HTTP method.
   * Overrides the default GET-based heuristic. Useful for APIs like Dropbox
   * that use POST for read operations.
   */
  idempotent?: boolean;
}

/**
 * Executes an HTTP request with retry, backoff, and timeout.
 *
 * @example
 * ```ts
 * const data = await requestWithRetry<MyResponse>(url, init, {
 *   method: 'POST',
 *   createError: (msg, status, body) => new MyApiError(msg, status, body),
 * });
 * ```
 */
export async function requestWithRetry<T>(
  url: string,
  init: RequestInit,
  options: RequestWithRetryOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    maxAttempts = DEFAULT_MAX_REQUEST_ATTEMPTS,
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
    includeBodyInError = true,
    createError,
    idempotent,
  } = options;

  let lastError: Error | null = null;
  const isIdempotent = idempotent ?? method === 'GET';

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    // Combine the timeout signal with any caller-supplied signal so that
    // either one can abort the request.
    const signals: AbortSignal[] = [controller.signal];
    if (init.signal) signals.push(init.signal as AbortSignal);
    const combinedSignal = signals.length > 1 ? AbortSignal.any(signals) : controller.signal;

    try {
      const response = await fetch(url, { ...init, signal: combinedSignal });
      const body = await response.text();

      if (!response.ok) {
        const error = createError
          ? createError(
              `API request failed with status ${response.status}`,
              response.status,
              includeBodyInError ? body : ''
            )
          : Object.assign(
              new Error(`API request failed with status ${response.status}`),
              { status: response.status, responseBody: includeBodyInError ? body : '' }
            );

        const canRetryStatus = isIdempotent
          ? RETRYABLE_STATUSES.has(response.status)
          : SAFE_RETRY_STATUSES_FOR_MUTATING.has(response.status);

        if (attempt < maxAttempts && canRetryStatus) {
          await sleep(backoffMs(attempt));
          continue;
        }

        throw error;
      }

      if (body.length === 0) {
        return {} as T;
      }

      try {
        return JSON.parse(body) as T;
      } catch (parseError) {
        const msg = `Failed to parse API response: ${String(parseError)}`;
        throw createError
          ? createError(msg, response.status, body.slice(0, 500))
          : new Error(msg);
      }
    } catch (error) {
      lastError = error as Error;

      const errorStatus = (error as { status?: number }).status;
      if (typeof errorStatus === 'number') {
        const canRetryStatus = isIdempotent
          ? RETRYABLE_STATUSES.has(errorStatus)
          : SAFE_RETRY_STATUSES_FOR_MUTATING.has(errorStatus);
        if (attempt < maxAttempts && canRetryStatus) {
          await sleep(backoffMs(attempt));
          continue;
        }
      } else if (isIdempotent && attempt < maxAttempts) {
        // Network errors — only retry for idempotent requests.
        await sleep(backoffMs(attempt));
        continue;
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error('Request failed after retries.');
}

/**
 * Like {@link requestWithRetry}, but returns the raw `Response` instead of
 * parsing JSON. Useful for binary downloads where the caller needs to read
 * headers or stream the body.
 */
export async function requestResponseWithRetry(
  url: string,
  init: RequestInit,
  options: RequestWithRetryOptions = {}
): Promise<Response> {
  const {
    method = 'GET',
    maxAttempts = DEFAULT_MAX_REQUEST_ATTEMPTS,
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
    includeBodyInError = true,
    createError,
    idempotent,
  } = options;

  let lastError: Error | null = null;
  const isIdempotent = idempotent ?? method === 'GET';

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const signals: AbortSignal[] = [controller.signal];
    if (init.signal) signals.push(init.signal as AbortSignal);
    const combinedSignal = signals.length > 1 ? AbortSignal.any(signals) : controller.signal;

    try {
      const response = await fetch(url, { ...init, signal: combinedSignal });

      if (!response.ok) {
        const body = includeBodyInError ? await response.text() : '';
        const error = createError
          ? createError(
              `API request failed with status ${response.status}`,
              response.status,
              body
            )
          : Object.assign(
              new Error(`API request failed with status ${response.status}`),
              { status: response.status, responseBody: body }
            );

        const canRetryStatus = isIdempotent
          ? RETRYABLE_STATUSES.has(response.status)
          : SAFE_RETRY_STATUSES_FOR_MUTATING.has(response.status);

        if (attempt < maxAttempts && canRetryStatus) {
          await sleep(backoffMs(attempt));
          continue;
        }

        throw error;
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      const errorStatus = (error as { status?: number }).status;
      if (typeof errorStatus === 'number') {
        const canRetryStatus = isIdempotent
          ? RETRYABLE_STATUSES.has(errorStatus)
          : SAFE_RETRY_STATUSES_FOR_MUTATING.has(errorStatus);
        if (attempt < maxAttempts && canRetryStatus) {
          await sleep(backoffMs(attempt));
          continue;
        }
      } else if (isIdempotent && attempt < maxAttempts) {
        await sleep(backoffMs(attempt));
        continue;
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error('Request failed after retries.');
}
