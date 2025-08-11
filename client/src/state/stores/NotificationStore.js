import { create } from 'zustand';
import axios from '../../utils/setupAxios.js';
import { SERVER } from "../../config/global.js";

let updateNotificationsCountGlobal = null;

export const setUpdateNotificationsCount = (updateFn) => {
  updateNotificationsCountGlobal = updateFn;
};

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  isLoaded: false,
  
  fetchNotifications: async () => {
    const currentState = get();
    
    if (currentState.isLoaded) {
      return;
    }
    
    if (currentState.loading) {
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get(`${SERVER}/api/users/get-notifications`);
      
      if (response.data && response.data.notifications) {
        const unreadCount = response.data.notifications.filter(
          notification => !notification.read
        ).length;
        
        set({ 
          notifications: response.data.notifications,
          unreadCount,
          loading: false,
          isLoaded: true 
        });
      }
    } catch (error) {
      console.error('Eroare la încărcarea notificărilor:', error);
      set({ 
        error: error.response?.data?.message || 'Eroare la încărcarea notificărilor',
        loading: false 
      });
    }
  },
  
  markAllAsRead: async () => {
    try {
      await axios.patch(`${SERVER}/api/users/get-notifications/mark-read`);
      
      set(state => ({
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true
        })),
        unreadCount: 0
      }));
      
      if (updateNotificationsCountGlobal) {
        updateNotificationsCountGlobal(0);
      }
      
      return true;
    } catch (error) {
      console.error('Eroare la marcarea notificărilor ca citite:', error);
      return false;
    }
  },
  
  markAsRead: async (notificationId) => {
    try {
      await axios.patch(`${SERVER}/api/users/get-notifications/get-notification/${notificationId}/mark-read`);
      
      set(state => {
        const updatedNotifications = state.notifications.map(notification => {
          if (notification.notification_id === notificationId && !notification.read) {
            return { ...notification, read: true };
          }
          return notification;
        });
        
        const unreadCount = updatedNotifications.filter(
          notification => !notification.read
        ).length;
        
        if (updateNotificationsCountGlobal) {
          updateNotificationsCountGlobal(unreadCount);
        }
        
        return {
          notifications: updatedNotifications,
          unreadCount
        };
      });
      
      return true;
    } catch (error) {
      console.error(`Eroare la marcarea notificării ${notificationId} ca citită:`, error);
      return false;
    }
  },
  
  resetStore: () => {
    set({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      isLoaded: false 
    });
  }
}));

export default useNotificationStore;