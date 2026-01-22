import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { Alert, AlertColor, Snackbar } from '@mui/material';

// أنواع التنبيهات
export interface Notification {
  id: string;
  message: string;
  type: AlertColor;
  duration?: number;
  action?: ReactNode;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type?: AlertColor, duration?: number, action?: ReactNode) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  maxNotifications = 5 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // إضافة تنبيه جديد
  const addNotification = useCallback((
    message: string, 
    type: AlertColor = 'info', 
    duration = 6000,
    action?: ReactNode
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const newNotification: Notification = {
      id,
      message,
      type,
      duration,
      action,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      if (updated.length > maxNotifications) {
        return updated.slice(0, maxNotifications);
      }
      return updated;
    });

    // إزالة التنبيه تلقائياً بعد المدة المحددة
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [maxNotifications]);

  // إزالة تنبيه
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // مسح جميع التنبيهات
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // دوال مساعدة لأنواع التنبيهات
  const success = useCallback((message: string, duration?: number) => {
    addNotification(message, 'success', duration);
  }, [addNotification]);

  const error = useCallback((message: string, duration?: number) => {
    addNotification(message, 'error', duration);
  }, [addNotification]);

  const warning = useCallback((message: string, duration?: number) => {
    addNotification(message, 'warning', duration);
  }, [addNotification]);

  const info = useCallback((message: string, duration?: number) => {
    addNotification(message, 'info', duration);
  }, [addNotification]);

  // معالجة إغلاق التنبيه
  const handleClose = (id: string) => (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    removeNotification(id);
  };

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* عرض التنبيهات */}
      {notifications.map(notification => (
        <Snackbar
          key={notification.id}
          anchorOrigin={{ 
            vertical: 'bottom', 
            horizontal: 'left' 
          }}
          open={true}
          autoHideDuration={notification.duration}
          onClose={handleClose(notification.id)}
          sx={{ 
            position: 'fixed',
            zIndex: 9999,
            bottom: 70 + (notifications.indexOf(notification) * 70),
            left: 20,
          }}
        >
          <Alert
            severity={notification.type}
            onClose={handleClose(notification.id)}
            sx={{ 
              width: '100%',
              boxShadow: 3,
              alignItems: 'center',
            }}
            action={notification.action}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
};
