// utils/toast.ts
'use client';

import { useState, useEffect } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

let toasts: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];
let id = 0;

const toast = {
  success: (message: string, duration: number = 3000) => {
    addToast(message, 'success', duration);
  },
  error: (message: string, duration: number = 5000) => {
    addToast(message, 'error', duration);
  },
  info: (message: string, duration: number = 3000) => {
    addToast(message, 'info', duration);
  },
};

function addToast(message: string, type: Toast['type'], duration: number) {
  const toast: Toast = {
    id: id++,
    message,
    type,
    duration,
  };
  
  toasts.push(toast);
  emitChange();
  
  setTimeout(() => {
    removeToast(toast.id);
  }, duration);
}

function removeToast(id: number) {
  toasts = toasts.filter(t => t.id !== id);
  emitChange();
}

function emitChange() {
  listeners.forEach(listener => listener([...toasts]));
}

export function useToasts() {
  const [toastList, setToastList] = useState<Toast[]>(toasts);
  
  useEffect(() => {
    listeners.push(setToastList);
    return () => {
      listeners = listeners.filter(l => l !== setToastList);
    };
  }, []);
  
  return toastList;
}

export { toast };

// Toast Container Component
export function ToastContainer() {
  const toasts = useToasts();
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg max-w-md animate-slideIn ${
            toast.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : toast.type === 'error'
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}
        >
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}