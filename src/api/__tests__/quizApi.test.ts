import { getQuizQuestions } from "../quizApi";
import { errorScenarios } from "./mocks";
import { handleApiError } from "../../utils/errorHandler";

describe("Quiz API - Error Scenarios", () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("handles 500 error in question fetch", async () => {
    mockFetch.mockResolvedValueOnce(errorScenarios.server500({}));

    const result = await getQuizQuestions();

    expect(result).toEqual([]);
  });

  it("handles 503 service unavailable", async () => {
    mockFetch.mockResolvedValueOnce(errorScenarios.serviceUnavailable503({}));

    const result = await getQuizQuestions();

    expect(result).toEqual([]);
  });

  it("handles 429 rate limiting", async () => {
    mockFetch.mockResolvedValueOnce(errorScenarios.rateLimited429({}));

    const result = await getQuizQuestions();

    expect(result).toEqual([]);
  });

  it("handles 404 not found gracefully", async () => {
    mockFetch.mockResolvedValueOnce(errorScenarios.notFound404({}));

    const result = await getQuizQuestions();

    expect(result).toEqual([]);
  });

  it("error handler returns correct message for Quiz API", () => {
    const result = handleApiError(
      new Response(null, { status: 503 }),
      { apiName: "Quiz", action: "fetch_questions" }
    );

    expect(result.message).toContain("temporarily unavailable");
    expect(result.shouldRetry).toBe(true);
  });
});
