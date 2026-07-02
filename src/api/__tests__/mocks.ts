/**
 * Shared mock response utilities for API tests.
 * Eliminates duplication and supports flexible HTTP status codes.
 *
 * Note: These return Response-like objects (not Promises) for use with Jest's
 * mockResolvedValueOnce(), which automatically wraps values in Promise.resolve()
 */

export const mockResponse = (
  data: Record<string, unknown>,
  ok: boolean = true,
  status: number = ok ? 200 : 404
) => ({
  ok,
  status,
  json: () => Promise.resolve(data),
} as Response);

export const wikipediaResponse = (
  data: Record<string, unknown>,
  status: number = 200
) =>
  mockResponse(data, status === 200, status);

export const wikidataResponse = (
  data: Record<string, unknown>,
  status: number = 200
) =>
  mockResponse(data, status === 200, status);

export const wikipediaSummaryResponse = (
  data: Record<string, unknown>,
  ok: boolean = true
) =>
  mockResponse(data, ok, ok ? 200 : 404);

export const wikipediaDetailsResponse = (
  page: Record<string, unknown>
) =>
  mockResponse({ query: { pages: { "123": page } } }, true, 200);

export const wikidataSearchResponse = (
  results?: Record<string, unknown>[]
) =>
  mockResponse({ search: results || [] }, true, 200);

export const wikidataEntityResponse = (
  entityId: string,
  descriptions?: Record<string, unknown>
) =>
  mockResponse(
    {
      entities: {
        [entityId]: {
          descriptions: descriptions || {
            en: { value: "A type of car" },
          },
          labels: {
            en: { value: "Some Car" },
          },
        },
      },
    },
    true,
    200
  );

/**
 * Error scenario responses for testing API error handling.
 * Each returns a Response-like object with appropriate status code.
 */
export const errorScenarios = {
  server500: (data: Record<string, unknown> = {}) =>
    mockResponse(data, false, 500),

  serviceUnavailable503: (data: Record<string, unknown> = {}) =>
    mockResponse(data, false, 503),

  rateLimited429: (data: Record<string, unknown> = {}) =>
    mockResponse(data, false, 429),

  notFound404: (data: Record<string, unknown> = {}) =>
    mockResponse(data, false, 404),

  badRequest400: (data: Record<string, unknown> = {}) =>
    mockResponse(data, false, 400),
};
