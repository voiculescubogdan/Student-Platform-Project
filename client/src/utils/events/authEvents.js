import { resetLikedPostsStore, initializeLikes } from '../likedPostUtil';

const authEvents = {
  onLogin: async () => {
    await initializeLikes();
  },
  
  onLogout: () => {
    resetLikedPostsStore();
  }
};

export default authEvents;