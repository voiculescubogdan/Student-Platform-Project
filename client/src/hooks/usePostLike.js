import { useState, useEffect } from 'react';
import useLikedPostStore from '../state/stores/LikedPostStore';
import { useAuth } from './useAuth';

export default function usePostLike(postId, initialLikesCount = 0) {
  const { isPostLiked, toggleLike, isLoaded, isLoading } = useLikedPostStore();
  const { isAuthenticated } = useAuth();
  
  const [localLikesCount, setLocalLikesCount] = useState(initialLikesCount);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (postId) {
      if (isAuthenticated) {
        if (isLoaded) {
          setLiked(isPostLiked(postId));
        } else {
          setLiked(false);
        }
      } else {
        setLiked(false);
      }
    }
  }, [postId, isPostLiked, isLoaded, isAuthenticated]);
  
  useEffect(() => {
    setLocalLikesCount(initialLikesCount);
  }, [initialLikesCount]);

  const handleLikeToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Trebuie să fii autentificat pentru a da like!');
      return;
    }
    
    const newLikeState = !liked;
    setLiked(newLikeState);
    setLocalLikesCount(prevCount => newLikeState ? prevCount + 1 : prevCount - 1);
    
    const success = await toggleLike(postId);
    
    if (!success) {
      setLiked(!newLikeState);
      setLocalLikesCount(prevCount => !newLikeState ? prevCount + 1 : prevCount - 1);
    }
  };

  return {
    liked,
    localLikesCount,
    handleLikeToggle,
    isLoading: isAuthenticated && isLoading && !isLoaded
  };
}