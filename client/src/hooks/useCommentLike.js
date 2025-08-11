import { useState, useEffect } from 'react';
import useLikedCommentStore from '../state/stores/LikedCommentStore';
import { useAuth } from './useAuth';

export default function useCommentLike(commentId, postId, initialLikesCount = 0) {
  const { isCommentLiked, toggleLike, isLoaded, isLoading } = useLikedCommentStore();
  const { isAuthenticated } = useAuth();
  
  const [localLikesCount, setLocalLikesCount] = useState(initialLikesCount);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (commentId) {
      if (isAuthenticated) {
        if (isLoaded) {
          setLiked(isCommentLiked(commentId));
        } else {
          setLiked(false);
        }
      } else {
        setLiked(false);
      }
    }
  }, [commentId, isCommentLiked, isLoaded, isAuthenticated]);
  
  useEffect(() => {
    setLocalLikesCount(initialLikesCount);
  }, [initialLikesCount]);

  const handleLikeToggle = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isAuthenticated) {
      alert('Trebuie să fii autentificat pentru a da like!');
      return;
    }
    
    const newLikeState = !liked;
    setLiked(newLikeState);
    setLocalLikesCount(prevCount => newLikeState ? prevCount + 1 : prevCount - 1);
    
    const success = await toggleLike(commentId, postId);
    
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