import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  requestWithRetry,
  requestResponseWithRetry,
  backoffMs,
  RETRYABLE_STATUSES,
  SAFE_RETRY_STATUSES_FOR_MUTATING,
} from './httpRetry.js';

// Stub global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function fakeResponse(body: string, status = 200, headers: Record<string, string> = {}): object {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: new Headers(headers),
    text: vi.fn().mockResolvedValue(body),
    arrayBuffer: vi.fn().mockResolvedValue(new TextEncoder().encode(body).buffer),
  };
}

function jsonResponse(body: unknown, status = 200): object {
  return fakeResponse(JSON.stringify(body), status, { 'Content-Type': 'application/json' });
}

function errorResponse(status: number, body = ''): object {
  return fakeResponse(body, status);
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('backoffMs', () => {
  it('returns 250 for attempt 1', () => {
    expect(backoffMs(1)).toBe(250);
  });

  it('returns 500 for attempt 2', () => {
    expect(backoffMs(2)).toBe(500);
  });

  it('caps at 2000 ms', () => {
    expect(backoffMs(5)).toBe(2000);
    expect(backoffMs(10)).toBe(2000);
  });
});

describe('retry status sets', () => {
  it('RETRYABLE_STATUSES includes expected codes', () => {
    for (const code of [429, 500, 502, 503, 504]) {
      expect(RETRYABLE_STATUSES.has(code)).toBe(true);
    }
    expect(RETRYABLE_STATUSES.has(400)).toBe(false);
    expect(RETRYABLE_STATUSES.has(401)).toBe(false);
  });

  it('SAFE_RETRY_STATUSES_FOR_MUTATING only includes 429', () => {
    expect(SAFE_RETRY_STATUSES_FOR_MUTATING.has(429)).toBe(true);
    expect(SAFE_RETRY_STATUSES_FOR_MUTATING.has(500)).toBe(false);
    expect(SAFE_RETRY_STATUSES_FOR_MUTATING.has(502)).toBe(false);
  });
});

describe('requestWithRetry', () => {
  it('returns parsed JSON on success', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));

    const result = await requestWithRetry<{ ok: boolean }>('https://example.com', {});
    expect(result).toEqual({ ok: true });
  });

  it('returns empty object for empty response body', async () => {
    mockFetch.mockResolvedValueOnce(new Response('', { status: 200 }));

    const result = await requestWithRetry('https://example.com', {});
    expect(result).toEqual({});
  });

  it('GET retries on 500', async () => {
    mockFetch
      .mockResolvedValueOnce(errorResponse(500))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const result = await requestWithRetry<{ ok: boolean }>('https://example.com', {}, {
      method: 'GET',
    });
    expect(result).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('GET retries on 502, 503, 504', async () => {
    for (const status of [502, 503, 504]) {
      mockFetch.mockReset();
      mockFetch
        .mockResolvedValueOnce(errorResponse(status))
        .mockResolvedValueOnce(jsonResponse({ ok: true }));

      const result = await requestWithRetry<{ ok: boolean }>('https://example.com', {}, {
        method: 'GET',
      });
      expect(result).toEqual({ ok: true });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    }
  });

  it('GET retries on 429', async () => {
    mockFetch
      .mockResolvedValueOnce(errorResponse(429))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const result = await requestWithRetry<{ ok: boolean }>('https://example.com', {}, {
      method: 'GET',
    });
    expect(result).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('POST does NOT retry on 500', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse(500, 'Internal Server Error'));

    await expect(
      requestWithRetry('https://example.com', {}, { method: 'POST' })
    ).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('POST does NOT retry on 502/503/504', async () => {
    for (const status of [502, 503, 504]) {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce(errorResponse(status, 'Error'));

      await expect(
        requestWithRetry('https://example.com', {}, { method: 'POST' })
      ).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    }
  });

  it('POST retries on 429 (rate limit)', async () => {
    mockFetch
      .mockResolvedValueOnce(errorResponse(429))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const result = await requestWithRetry<{ ok: boolean }>('https://example.com', {}, {
      method: 'POST',
    });
    expect(result).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('PUT does NOT retry on 500', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse(500, 'Error'));

    await expect(
      requestWithRetry('https://example.com', {}, { method: 'PUT' })
    ).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('DELETE does NOT retry on 500', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse(500, 'Error'));

    await expect(
      requestWithRetry('https://example.com', {}, { method: 'DELETE' })
    ).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('GET retries on network errors', async () => {
    mockFetch
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const result = await requestWithRetry<{ ok: boolean }>('https://example.com', {}, {
      method: 'GET',
    });
    expect(result).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('POST does NOT retry on network errors', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(
      requestWithRetry('https://example.com', {}, { method: 'POST' })
    ).rejects.toThrow('fetch failed');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('respects maxAttempts', async () => {
    mockFetch
      .mockResolvedValueOnce(errorResponse(429))
      .mockResolvedValueOnce(errorResponse(429));

    await expect(
      requestWithRetry('https://example.com', {}, { method: 'GET', maxAttempts: 2 })
    ).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('throws on non-retryable status (e.g. 401)', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse(401, 'Unauthorized'));

    await expect(
      requestWithRetry('https://example.com', {}, { method: 'GET' })
    ).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('uses createError factory when provided', async () => {
    class CustomError extends Error {
      constructor(message: string, public status: number, public body: string) {
        super(message);
      }
    }

    mockFetch.mockResolvedValueOnce(errorResponse(400, 'Bad Request'));

    await expect(
      requestWithRetry('https://example.com', {}, {
        method: 'GET',
        createError: (msg, status, body) => new CustomError(msg, status, body),
      })
    ).rejects.toBeInstanceOf(CustomError);
  });

  it('throws on JSON parse error', async () => {
    mockFetch.mockImplementation(async () => fakeResponse('not json'));

    await expect(
      requestWithRetry('https://example.com', {}, { maxAttempts: 1 })
    ).rejects.toThrow(/Failed to parse/);
  });

  it('idempotent option overrides method heuristic', async () => {
    // POST with idempotent: true should retry on 500 (like GET)
    mockFetch
      .mockResolvedValueOnce(errorResponse(500))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const result = await requestWithRetry<{ ok: boolean }>('https://example.com', {}, {
      method: 'POST',
      idempotent: true,
    });
    expect(result).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('idempotent: false makes GET non-retryable on 500', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse(500, 'Error'));

    await expect(
      requestWithRetry('https://example.com', {}, {
        method: 'GET',
        idempotent: false,
      })
    ).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('requestResponseWithRetry', () => {
  it('returns raw response on success', async () => {
    const fakeResp = fakeResponse('binary data');
    mockFetch.mockResolvedValueOnce(fakeResp);

    const response = await requestResponseWithRetry('https://example.com', {});
    expect(response).toBe(fakeResp);
  });

  it('GET retries on 500', async () => {
    mockFetch
      .mockResolvedValueOnce(errorResponse(500))
      .mockResolvedValueOnce(fakeResponse('ok'));

    const response = await requestResponseWithRetry('https://example.com', {}, {
      method: 'GET',
    });
    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('POST does NOT retry on 500', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse(500, 'Error'));

    await expect(
      requestResponseWithRetry('https://example.com', {}, { method: 'POST' })
    ).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('POST retries on 429', async () => {
    mockFetch
      .mockResolvedValueOnce(errorResponse(429))
      .mockResolvedValueOnce(fakeResponse('ok'));

    const response = await requestResponseWithRetry('https://example.com', {}, {
      method: 'POST',
    });
    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('idempotent: true allows POST to retry on 500', async () => {
    mockFetch
      .mockResolvedValueOnce(errorResponse(500))
      .mockResolvedValueOnce(fakeResponse('ok'));

    const response = await requestResponseWithRetry('https://example.com', {}, {
      method: 'POST',
      idempotent: true,
    });
    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('GET retries on network errors', async () => {
    mockFetch
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(fakeResponse('ok'));

    const response = await requestResponseWithRetry('https://example.com', {}, {
      method: 'GET',
    });
    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('POST does NOT retry on network errors', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(
      requestResponseWithRetry('https://example.com', {}, { method: 'POST' })
    ).rejects.toThrow('fetch failed');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
