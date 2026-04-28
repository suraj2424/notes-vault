'use client';

import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error caught by boundary:', error, errorInfo);
  }

  private getErrorMessage() {
    const rawMessage = this.state.error?.message;

    if (!rawMessage) {
      return 'Something went wrong. Please try again later.';
    }

    try {
      const parsedError = JSON.parse(rawMessage);
      if (
        typeof parsedError?.error === 'string' &&
        parsedError.error.includes('insufficient permissions')
      ) {
        return "You don't have permission to perform this action. Please check your account settings.";
      }
    } catch {
      // Keep the generic fallback for non-JSON errors.
    }

    return 'Something went wrong. Please try again later.';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center dark:bg-neutral-900">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-neutral-200 text-neutral-400 dark:border-neutral-900 dark:text-neutral-500">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h1 className="mb-2 font-serif text-3xl tracking-tight text-neutral-950 dark:text-white">
            Application Error
          </h1>
          <p className="mb-8 max-w-md text-[14px] text-neutral-500 dark:text-neutral-400">
            {this.getErrorMessage()}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            <RefreshCcw className="h-4 w-4" />
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
