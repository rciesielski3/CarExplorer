import React from 'react';
import { render, screen, cleanup } from '@testing-library/react-native';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Text } from 'react-native';

describe('ErrorBoundary', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <Text>Test Content</Text>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test Content')).toBeTruthy();
  });

  it('renders error fallback when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary apiName="Wikipedia">
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/error occurred/i)).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn();
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });
});
