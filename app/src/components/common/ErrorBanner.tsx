import React from 'react';

type Props = { title?: string; message?: string; onRetry?: () => void };
export default function ErrorBanner({ title = 'Something went wrong', message, onRetry }: Props) {
  return (
    <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-red-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{title}</p>
          {message && <p className="text-sm opacity-90">{message}</p>}
        </div>
        {onRetry && (
          <button onClick={onRetry} className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
