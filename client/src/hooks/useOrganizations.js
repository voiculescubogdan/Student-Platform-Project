import { useState, useEffect } from 'react';
import OrganizationStore from '../state/stores/OrganizationStore';

export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await OrganizationStore.getAllOrganizations();
        setOrganizations(response.organizations || []);
      } catch (err) {
        console.error('Eroare la încărcarea organizațiilor:', err);
        setError(err.message || 'A apărut o eroare la încărcarea organizațiilor');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const refreshOrganizations = async () => {
    OrganizationStore.invalidateCache();
    const response = await OrganizationStore.getAllOrganizations();
    setOrganizations(response.organizations || []);
  };

  return {
    organizations,
    loading,
    error,
    refreshOrganizations
  };
};