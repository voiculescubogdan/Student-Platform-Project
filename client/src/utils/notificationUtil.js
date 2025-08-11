import useNotificationStore from '../state/stores/NotificationStore';

let isInitializing = false;

export const initializeNotifications = async () => {
  if (isInitializing) {
    return;
  }
  
  const state = useNotificationStore.getState();
  
  if (state.isLoaded) {
    return;
  }
  
  if (state.loading) {
    return;
  }
  
  isInitializing = true;
  
  try {
    await useNotificationStore.getState().fetchNotifications();
  } finally {
    isInitializing = false;
  }
};

export const resetNotificationsStore = () => {
  isInitializing = false;
  return useNotificationStore.getState().resetStore();
};

export const getUnreadNotificationsCount = () => {
  return useNotificationStore.getState().unreadCount;
};