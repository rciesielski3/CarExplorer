import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react-native';
import { Toast, toastManager } from '../components/Toast';

describe('Toast', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    toastManager.clear();
  });

  it('renders toast when shown', async () => {
    render(<Toast />);

    await act(async () => {
      toastManager.show('Test message', 'error', 4000);
    });

    expect(screen.getByText('Test message')).toBeTruthy();
  });

  it('dismisses toast after specified duration', async () => {
    jest.useFakeTimers();
    render(<Toast />);

    await act(async () => {
      toastManager.show('Temporary message', 'warning', 100);
    });

    expect(screen.getByText('Temporary message')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(150);
    });

    expect(screen.queryByText('Temporary message')).toBeNull();

    jest.useRealTimers();
  });

  it('implements FIFO queue - removes oldest when max capacity reached', async () => {
    render(<Toast />);

    await act(async () => {
      toastManager.show('Message 1', 'error');
      toastManager.show('Message 2', 'error');
      toastManager.show('Message 3', 'error');
      toastManager.show('Message 4', 'error'); // Should shift out Message 1
    });

    // Message 1 should be removed (FIFO)
    expect(screen.queryByText('Message 1')).toBeNull();
    // Messages 2, 3, 4 should be visible
    expect(screen.getByText('Message 2')).toBeTruthy();
    expect(screen.getByText('Message 3')).toBeTruthy();
    expect(screen.getByText('Message 4')).toBeTruthy();
  });
});
