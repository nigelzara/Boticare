import React, { useEffect } from 'react';
import { CheckCircleIcon, XIcon } from './Icons';

interface ToastProps {
  message: string;
  type: 'success'; // For now, only success is styled
  onClose: () => void;
}

const typeStyles = {
    success: {
        bg: 'bg-boticare-green dark:bg-green-900/50',
        iconColor: 'text-boticare-green-dark dark:text-green-300',
        Icon: CheckCircleIcon,
    },
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const styles = typeStyles[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className={`fixed top-24 right-8 z-50 p-4 rounded-xl shadow-lg flex items-center space-x-3 animate-fade-in ${styles.bg}`}>
      <styles.Icon className={`w-6 h-6 ${styles.iconColor}`} />
      <p className={`font-semibold text-sm ${styles.iconColor}`}>{message}</p>
      <button onClick={onClose} className={`ml-auto p-1 rounded-full hover:bg-black/10`}>
        <XIcon className={`w-4 h-4 ${styles.iconColor}`} />
      </button>
    </div>
  );
};

export default Toast;