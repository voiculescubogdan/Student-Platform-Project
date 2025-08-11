import { useState, useEffect } from 'react';
import PostStore from '../state/stores/PostStore';

export function usePost(postId) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAssigned, setIsAssigned] = useState(false);
  
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      try {
        setLoading(true);
        const response = await PostStore.getPost(postId);
        setPost(response.post);
        setIsAssigned(response.isAssigned || false);
      } catch (err) {
        console.error('Eroare la încărcarea postării:', err);
        setError(err.message || 'Nu s-a putut încărca postarea.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  return { post, loading, error, isAssigned };
}