import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '../../utils/setupAxios.js';
import { SERVER } from "../../config/global.js";

const useLikedCommentStore = create(
  persist(
    (set, get) => ({
      likedComments: new Set(),
      
      isLoaded: false,
      
      isLoading: false,
  
  initializeLikes: async () => {
    try {
      const state = get();
      
      if (state.isLoaded || state.isLoading) {
        return;
      }
      
      set({ isLoading: true });
      
      const response = await axios.get(`${SERVER}/api/users/posts/get-comments/liked-comments`);
      
      if (response.data && response.data.likedComments) {
        const likedCommentsSet = new Set(response.data.likedComments.map(comment => comment.comment_id));
        
        set({ 
          likedComments: likedCommentsSet,
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
      console.error('Eroare la încărcarea like-urilor pentru comentarii:', error);
      set({ 
        isLoaded: true,
        isLoading: false
      });
    }
  },
  
  isCommentLiked: (commentId) => {
    return get().likedComments.has(parseInt(commentId));
  },
  
  toggleLike: async (commentId) => {
    try {
      const isCurrentlyLiked = get().isCommentLiked(commentId);
      
      const newLikedComments = new Set(get().likedComments);
      
      if (isCurrentlyLiked) {
        newLikedComments.delete(parseInt(commentId));
      } else {
        newLikedComments.add(parseInt(commentId));
      }
      
      set({ likedComments: newLikedComments });
      
      await axios.post(`${SERVER}/api/users/posts/get-comment/${commentId}/likeUnlikeComment`);
      
      return true;
    } catch (error) {
      console.error('Eroare la actualizarea like-ului comentariului:', error);
      
      const originalLikedComments = new Set(get().likedComments);
      const wasLiked = get().isCommentLiked(commentId);
      
      if (wasLiked) {
        originalLikedComments.add(parseInt(commentId));
      } else {
        originalLikedComments.delete(parseInt(commentId));
      }
      
      set({ likedComments: originalLikedComments });
      return false;
    }
  },
  
  resetStore: () => {
    set({ 
      likedComments: new Set(),
      isLoaded: false,
      isLoading: false
    });
  }
}),
{
  name: 'liked-comments-storage',
  storage: {
    getItem: (name) => {
      const str = localStorage.getItem(name);
      if (!str) return null;
      const data = JSON.parse(str);
      if (data.state?.likedComments) {
        data.state.likedComments = new Set(data.state.likedComments);
      }
      return data;
    },
    setItem: (name, value) => {
      const serializedValue = {
        ...value,
        state: {
          ...value.state,
          likedComments: Array.from(value.state.likedComments)
        }
      };
      localStorage.setItem(name, JSON.stringify(serializedValue));
    },
    removeItem: (name) => localStorage.removeItem(name),
  },
}
));

export default useLikedCommentStore;