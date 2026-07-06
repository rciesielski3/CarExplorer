import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

const MAX_TOASTS = 3;
let toastId = 0;

class ToastManager {
  private listeners: ((messages: ToastMessage[]) => void)[] = [];
  private messages: ToastMessage[] = [];
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  subscribe(listener: (messages: ToastMessage[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  clear() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
    this.messages = [];
    this.notify();
  }

  show(message: string, type: ToastType = 'info', duration: number = 4000) {
    const id = String(toastId++);
    const toast: ToastMessage = { id, message, type, duration };

    if (this.messages.length >= MAX_TOASTS) {
      // Remove the oldest toast (FIFO)
      const oldestToast = this.messages.shift();
      if (oldestToast) {
        const timeout = this.timeouts.get(oldestToast.id);
        if (timeout) clearTimeout(timeout);
        this.timeouts.delete(oldestToast.id);
      }
    }

    this.messages.push(toast);
    this.notify();

    const timeout = setTimeout(() => {
      this.messages = this.messages.filter(t => t.id !== id);
      this.timeouts.delete(id);
      this.notify();
    }, duration);

    this.timeouts.set(id, timeout);
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.messages]));
  }
}

export const toastManager = new ToastManager();

export const Toast: React.FC = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  React.useEffect(() => {
    return toastManager.subscribe(setMessages);
  }, []);

  return (
    <View style={styles.container}>
      {messages.map((msg, index) => (
        <ToastItem
          key={msg.id}
          message={msg}
          index={index}
        />
      ))}
    </View>
  );
};

const ToastItem: React.FC<{ message: ToastMessage; index: number }> = ({ message, index }) => {
  const backgroundColor = {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
  }[message.type];

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor,
          bottom: 20 + index * 80,
        },
      ]}
    >
      <Text style={styles.text}>{message.message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    pointerEvents: 'none',
  },
  toast: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
});
