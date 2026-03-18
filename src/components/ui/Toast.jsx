import { useEffect, useState } from 'react';
import { useEditorStore } from '../../store.js';

const Toast = ({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setIsExiting(true), notification.duration - 300);
    return () => clearTimeout(exitTimer);
  }, [notification.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(notification.id), 300);
  };

  const styles = {
    success: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' },
    error: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
  }[notification.type] || { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${styles.bg} ${styles.border} transition-all duration-300 ease-in-out ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'} min-w-[320px] max-w-md`}>
      <div className="flex-1 min-w-0">
        {notification.title && <p className="text-sm font-semibold text-gray-900 mb-0.5">{notification.title}</p>}
        <p className="text-sm text-gray-700">{notification.message}</p>
      </div>
      <button onClick={handleClose} className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const notifications = useEditorStore((state) => state.notifications);
  const removeNotification = useEditorStore((state) => state.removeNotification);

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Toast notification={notification} onClose={removeNotification} />
        </div>
      ))}
    </div>
  );
};

export default Toast;
