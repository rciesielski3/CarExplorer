import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Toast, toastManager } from '../components/Toast';
import { handleApiError } from '../utils/errorHandler';

describe('End-to-End Error Handling', () => {
  it('error boundary catches error and renders fallback', () => {
    const ThrowError = () => {
      throw new Error('API call failed');
    };

    render(
      <ErrorBoundary apiName="Wikipedia">
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/error occurred/i)).toBeTruthy();
    expect(screen.getByText(/try again/i)).toBeTruthy();
  });

  it('toast shows when API error is handled', async () => {
    render(<Toast />);

    const error = new Response(null, { status: 503 });
    const result = handleApiError(error, {
      apiName: 'Wikipedia',
      action: 'search',
    });

    toastManager.show(result.message, 'error');

    await waitFor(() => {
      expect(screen.getByText(/temporarily unavailable/i)).toBeTruthy();
    });
  });

  it('validates all API error types produce correct messages', () => {
    const testCases = [
      { status: 500, apiName: 'Wikipedia', expectedText: 'server error' },
      { status: 503, apiName: 'Wikidata', expectedText: 'temporarily unavailable' },
      { status: 429, apiName: 'CarImages', expectedText: 'Too many requests' },
      { status: 404, apiName: 'Quiz', expectedText: 'No results' },
    ];

    testCases.forEach(({ status, apiName, expectedText }) => {
      const result = handleApiError(
        new Response(null, { status }),
        { apiName, action: 'test' }
      );

      expect(result.message.toLowerCase()).toContain(expectedText.toLowerCase());
    });
  });

  it('validates retry logic based on error type', () => {
    const retryCases = [
      { status: 500, shouldRetry: true },
      { status: 503, shouldRetry: true },
      { status: 429, shouldRetry: true },
      { status: 404, shouldRetry: false },
      { status: 400, shouldRetry: false },
    ];

    retryCases.forEach(({ status, shouldRetry }) => {
      const result = handleApiError(
        new Response(null, { status }),
        { apiName: 'Test', action: 'test' }
      );

      expect(result.shouldRetry).toBe(shouldRetry);
    });
  });
});
