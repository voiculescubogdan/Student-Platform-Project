import useLikedCommentStore from '../state/stores/LikedCommentStore';

let isInitializing = false;

export const initializeCommentLikes = async () => {
  if (isInitializing) {
    return;
  }
  
  const state = useLikedCommentStore.getState();
  
  if (state.isLoaded || state.isLoading) {
    return;
  }
  
  isInitializing = true;
  
  try {
    await useLikedCommentStore.getState().initializeLikes();
  } finally {
    isInitializing = false;
  }
};

export const resetLikedCommentsStore = () => {
  isInitializing = false;
  localStorage.removeItem('liked-comments-storage');
  return useLikedCommentStore.getState().resetStore();
};