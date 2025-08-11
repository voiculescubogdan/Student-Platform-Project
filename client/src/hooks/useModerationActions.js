import { useState, useEffect, useMemo } from 'react';
import axios from '../utils/setupAxios';

export default function useModerationActions(user, post, isAssigned) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const [showModerationComplete, setShowModerationComplete] = useState(false);
  const [moderationResult, setModerationResult] = useState(null);
  
  const [postStatus, setPostStatus] = useState(null);

  useEffect(() => {
    if (post && post.status) {
      setPostStatus(post.status);
    }
  }, [post]);

  const canModerate = useMemo(() => {
    if (!post || !user) return false;
    
    const hasModeratorRole = user.user_type === 'Moderator' || user.user_type === 'Administrator';
    const isPending = post.status === 'pending';
    const isAssignedToUser = isAssigned;
    
    return hasModeratorRole && isPending && isAssignedToUser;
  }, [user, post, isAssigned]);
  
  const handleModerationAction = async (postId, action) => {
    if (isProcessing) return { success: false };
    
    try {
      setIsProcessing(true);
      setError(null);
      
      if (!['active', 'rejected'].includes(action)) {
        throw new Error('Acțiune de moderare invalidă');
      }
      
      const response = await axios.post(
        `/api/users/posts/get-post/${postId}/handlePost?handle=${action}`
      );
      
      const result = action === 'active' ? 'accepted' : 'rejected';
      const newStatus = action === 'active' ? 'active' : 'rejected';
      
      setPostStatus(newStatus);
      setModerationResult(result);
      setShowModerationComplete(true);
      
      return {
        success: true,
        data: response.data,
        action: result
      };
    } catch (error) {
      console.error('Eroare la procesarea acțiunii de moderare:', error);
      const errorMessage = error.response?.data?.message || 
                          `Eroare la ${action === 'active' ? 'acceptarea' : 'respingerea'} postării`;
      
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsProcessing(false);
    }
  };
  
  const acceptPost = async (postId) => {
    return await handleModerationAction(postId, 'active');
  };
  
  const rejectPost = async (postId) => {
    return await handleModerationAction(postId, 'rejected');
  };
  
  const handleModerationComplete = (action, data) => {
    const newStatus = action === 'accepted' ? 'active' : 'rejected';
    setPostStatus(newStatus);
    setModerationResult(action);
    setShowModerationComplete(true);
  };
  
  const clearError = () => {
    setError(null);
  };
  
  const resetModerationState = () => {
    setShowModerationComplete(false);
    setModerationResult(null);
    setError(null);
  };
  
  return {
    isProcessing,
    error,
    
    showModerationComplete,
    moderationResult,
    postStatus,
    
    canModerate,
    
    acceptPost,
    rejectPost,
    
    handleModerationComplete,
    clearError,
    resetModerationState
  };
}