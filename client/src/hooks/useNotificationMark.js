import { useState } from 'react';
import useNotificationStore from '../state/stores/NotificationStore';

export default function useNotificationMark() {
  const [isMarking, setIsMarking] = useState(false);
  const { markAsRead, markAllAsRead } = useNotificationStore();
  
  const handleMarkAsRead = async (notificationId) => {
    if (isMarking) return false;
    
    try {
      setIsMarking(true);
      const success = await markAsRead(notificationId);
      return success;
    } catch (error) {
      console.error('Eroare la marcarea notificării ca citită:', error);
      return false;
    } finally {
      setIsMarking(false);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    if (isMarking) return false;
    
    try {
      setIsMarking(true);
      const success = await markAllAsRead();
      return success;
    } catch (error) {
      console.error('Eroare la marcarea tuturor notificărilor ca citite:', error);
      return false;
    } finally {
      setIsMarking(false);
    }
  };
  
  return {
    isMarking,
    handleMarkAsRead,
    handleMarkAllAsRead
  };
}