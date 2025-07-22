import React from 'react';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { NotificationToast } from './NotificationToast';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationContext();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="animate-in slide-in-from-right-2 duration-300"
        >
          <NotificationToast
            notification={notification}
            onRemove={removeNotification}
          />
        </div>
      ))}
    </div>
  );
}; 
