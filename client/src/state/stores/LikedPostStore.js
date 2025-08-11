import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '../../utils/setupAxios.js';
import { SERVER } from "../../config/global.js";

const useLikedPostStore = create(
  persist(
    (set, get) => ({
      likedPosts: new Set(),
      
      isLoaded: false,
      
      isLoading: false,
  
  initializeLikes: async () => {
    try {
      const state = get();
      
      if (state.isLoaded || state.isLoading) {
        return;
      }
      
      set({ isLoading: true });
      
      const response = await axios.get(`${SERVER}/api/users/posts/liked-posts`);
      
      if (response.data && response.data.likedPosts) {
        const likedPostsSet = new Set(response.data.likedPosts.map(post => post.post_id));
        
        set({ 
          likedPosts: likedPostsSet,
          isLoaded: true,
          isLoading: false
        });
      } else {
        set({ 
          isLoaded: true,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Eroare la încărcarea like-urilor:', error);
      set({ 
        isLoaded: true,
        isLoading: false
      });
    }
  },
  
  isPostLiked: (postId) => {
    return get().likedPosts.has(parseInt(postId));
  },
  
  toggleLike: async (postId) => {
    try {
      const isCurrentlyLiked = get().isPostLiked(postId);
      
      const newLikedPosts = new Set(get().likedPosts);
      
      if (isCurrentlyLiked) {
        newLikedPosts.delete(parseInt(postId));
      } else {
        newLikedPosts.add(parseInt(postId));
      }
      
      set({ likedPosts: newLikedPosts });
      
      await axios.post(`${SERVER}/api/users/posts/get-post/${postId}/likeUnlikePost`);
      
      return true;
    } catch (error) {
      console.error('Eroare la actualizarea like-ului:', error);
      
      const originalLikedPosts = new Set(get().likedPosts);
      const wasLiked = get().isPostLiked(postId);
      
      if (wasLiked) {
        originalLikedPosts.add(parseInt(postId));
      } else {
        originalLikedPosts.delete(parseInt(postId));
      }
      
      set({ likedPosts: originalLikedPosts });
      return false;
    }
  },
  
  resetStore: () => {
    set({ 
      likedPosts: new Set(),
      isLoaded: false,
      isLoading: false
    });
  }
}),
{
  name: 'liked-posts-storage',
  storage: {
    getItem: (name) => {
      const str = localStorage.getItem(name);
      if (!str) return null;
      const data = JSON.parse(str);
      if (data.state?.likedPosts) {
        data.state.likedPosts = new Set(data.state.likedPosts);
      }
      return data;
    },
    setItem: (name, value) => {
      const serializedValue = {
        ...value,
        state: {
          ...value.state,
          likedPosts: Array.from(value.state.likedPosts)
        }
      };
      localStorage.setItem(name, JSON.stringify(serializedValue));
    },
    removeItem: (name) => localStorage.removeItem(name),
  },
}
));

export default useLikedPostStore;