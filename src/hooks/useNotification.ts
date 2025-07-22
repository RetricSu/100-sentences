import { useCallback } from 'react';
import { useNotificationContext } from '../contexts/NotificationContext';
import { NotificationType } from '../types/notification';

export const useNotification = () => {
  const { addNotification, removeNotification, clearNotifications } = useNotificationContext();

  const showNotification = useCallback((
    type: NotificationType,
    title: string,
    message?: string,
    options?: {
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    }
  ) => {
    return addNotification({
      type,
      title,
      message: message || '',
      duration: options?.duration,
      action: options?.action,
    });
  }, [addNotification]);

  const success = useCallback((
    title: string,
    message?: string,
    options?: { duration?: number; action?: { label: string; onClick: () => void; } }
  ) => {
    return showNotification('success', title, message, options);
  }, [showNotification]);

  const error = useCallback((
    title: string,
    message?: string,
    options?: { duration?: number; action?: { label: string; onClick: () => void; } }
  ) => {
    return showNotification('error', title, message, options);
  }, [showNotification]);

  const warning = useCallback((
    title: string,
    message?: string,
    options?: { duration?: number; action?: { label: string; onClick: () => void; } }
  ) => {
    return showNotification('warning', title, message, options);
  }, [showNotification]);

  const info = useCallback((
    title: string,
    message?: string,
    options?: { duration?: number; action?: { label: string; onClick: () => void; } }
  ) => {
    return showNotification('info', title, message, options);
  }, [showNotification]);

  return {
    showNotification,
    success,
    error,
    warning,
    info,
    removeNotification,
    clearNotifications,
  };
}; 
