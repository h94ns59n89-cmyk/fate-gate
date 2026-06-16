'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '4px',
            background: '#252526',
            color: '#d4d4d4',
            fontSize: '13px',
            border: '1px solid #3c3c3c',
          },
          success: { iconTheme: { primary: '#6a9955', secondary: '#d4d4d4' } },
          error: { iconTheme: { primary: '#f44747', secondary: '#d4d4d4' } },
        }}
      />
  );
}
