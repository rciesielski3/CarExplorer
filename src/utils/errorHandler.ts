export interface ErrorHandlingResult {
  message: string;
  shouldRetry: boolean;
  context: {
    apiName: string;
    action: string;
    statusCode?: number;
  };
}

export const handleApiError = (
  error: unknown,
  context: { apiName: string; action: string }
): ErrorHandlingResult => {
  let statusCode: number | undefined;
  let message = 'An error occurred. Please try again.';
  let shouldRetry = true;

  if (error instanceof Response) {
    statusCode = error.status;

    switch (error.status) {
      case 500:
      case 502:
        message = `${context.apiName} encountered a server error. Please try again.`;
        shouldRetry = true;
        break;
      case 503:
        message = `${context.apiName} is temporarily unavailable. Please try again in a moment.`;
        shouldRetry = true;
        break;
      case 429:
        message = 'Too many requests. Please wait a moment before trying again.';
        shouldRetry = true;
        break;
      case 404:
        message = 'No results found. Try a different search.';
        shouldRetry = false;
        break;
      case 400:
        message = 'Invalid request. Please check your input.';
        shouldRetry = false;
        break;
      default:
        message = `${context.apiName} returned an error (${error.status}). Please try again.`;
        shouldRetry = true;
    }
  } else if (error instanceof TypeError && error.message.includes('fetch')) {
    message = 'Network error. Please check your connection and try again.';
    shouldRetry = true;
  } else if (error instanceof Error) {
    console.error(`Error in ${context.apiName} ${context.action}:`, error.message);
    message = 'An unexpected error occurred. Please try again.';
    shouldRetry = true;
  }

  return {
    message,
    shouldRetry,
    context: {
      ...context,
      statusCode,
    },
  };
};
