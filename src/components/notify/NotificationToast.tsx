import React from 'react';
import { Notification } from '../../types/notification';

interface NotificationToastProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const getNotificationStyles = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-50 border-green-200',
        icon: 'text-green-600',
        title: 'text-green-800',
        message: 'text-green-700',
        close: 'text-green-400 hover:text-green-600',
      };
    case 'error':
      return {
        bg: 'bg-red-50 border-red-200',
        icon: 'text-red-600',
        title: 'text-red-800',
        message: 'text-red-700',
        close: 'text-red-400 hover:text-red-600',
      };
    case 'warning':
      return {
        bg: 'bg-amber-50 border-amber-200',
        icon: 'text-amber-600',
        title: 'text-amber-800',
        message: 'text-amber-700',
        close: 'text-amber-400 hover:text-amber-600',
      };
    case 'info':
      return {
        bg: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-600',
        title: 'text-blue-800',
        message: 'text-blue-700',
        close: 'text-blue-400 hover:text-blue-600',
      };
    default:
      return {
        bg: 'bg-gray-50 border-gray-200',
        icon: 'text-gray-600',
        title: 'text-gray-800',
        message: 'text-gray-700',
        close: 'text-gray-400 hover:text-gray-600',
      };
  }
};

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    case 'info':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onRemove }) => {
  const styles = getNotificationStyles(notification.type);

  return (
    <div
      className={`${styles.bg} border rounded-xl shadow-lg p-4 max-w-sm w-full transition-all duration-300 ease-in-out transform hover:scale-105`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`${styles.icon} flex-shrink-0 mt-0.5`}>
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={`${styles.title} font-medium text-sm`}>
            {notification.title}
          </div>
          {notification.message && (
            <div className={`${styles.message} text-sm mt-1`}>
              {notification.message}
            </div>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-xs font-medium underline hover:no-underline transition-all"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={() => onRemove(notification.id)}
          className={`${styles.close} flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-colors`}
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}; 
