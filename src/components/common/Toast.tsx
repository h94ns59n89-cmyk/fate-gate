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
            background: '#FFFFFF',
            color: '#1F1D2B',
            fontSize: '13px',
            border: '1px solid rgba(0,0,0,0.08)',
          },
          success: { iconTheme: { primary: '#8FCFA0', secondary: '#FFFFFF' } },
          error: { iconTheme: { primary: '#f44747', secondary: '#FFFFFF' } },
        }}
      />
  );
}
