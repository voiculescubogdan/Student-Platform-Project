import useLikedPostStore from '../state/stores/LikedPostStore';

let isInitializing = false;

export const initializePostLikes = async () => {
  if (isInitializing) {
    return;
  }
  
  const state = useLikedPostStore.getState();
  
  if (state.isLoaded || state.isLoading) {
    return;
  }
  
  isInitializing = true;
  
  try {
    await useLikedPostStore.getState().initializeLikes();
  } finally {
    isInitializing = false;
  }
};

export const resetLikedPostsStore = () => {
  isInitializing = false; 
  localStorage.removeItem('liked-posts-storage');
  return useLikedPostStore.getState().resetStore();
};