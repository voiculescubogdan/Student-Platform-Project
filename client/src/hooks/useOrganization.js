import { useState, useEffect } from 'react';
import PostStore from '../state/stores/PostStore';
import OrganizationStore from '../state/stores/OrganizationStore';

export const useSelectedOrganization = (organizationId) => {
  const [organization, setOrganization] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await PostStore.getOrganizationPosts(organizationId);
        
        setOrganization(response.organization);
        setIsFollowing(response.isFollowing || false);
      } catch (err) {
        console.error('Eroare la încărcarea datelor organizației:', err);
        setError(err.message || 'A apărut o eroare la încărcarea organizației');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationData();
  }, [organizationId]);

  const toggleFollow = async () => {
    try {
      await OrganizationStore.toggleFollowOrganization(organizationId);
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Eroare la urmărirea organizației:', err);
    }
  };

  return {
    organization,
    isFollowing,
    loading,
    error,
    toggleFollow
  };
};