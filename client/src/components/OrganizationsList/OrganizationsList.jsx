import React, { useState } from 'react';
import { useOrganizations } from '../../hooks/useOrganizations';
import Organization from './Organization/Organization';
import Feed from '../Feed/Feed';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { FaSearch } from 'react-icons/fa';
import './OrganizationsList.css';

const OrganizationsList = () => {
  const { organizations, loading, error, refreshOrganizations } = useOrganizations();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.description && org.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedOrganizations = [...filteredOrganizations].sort((a, b) => 
    (b.members_count || 0) - (a.members_count || 0)
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrganizations();
    } catch (err) {
      console.error('Eroare la reîmprospătarea organizațiilor:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <Feed>
        <LoadingSpinner message="Se încarcă organizațiile..." />
      </Feed>
    );
  }

  if (error) {
    return (
      <Feed title="Organizații">
        <div className="organizations-error">
          <div className="alert alert-danger">
            <h4>A apărut o eroare</h4>
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <FaSync className="spinning me-2" />
                  Se reîncarcă...
                </>
              ) : (
                <>
                  <FaSync className="me-2" />
                  Încearcă din nou
                </>
              )}
            </button>
          </div>
        </div>
      </Feed>
    );
  }

  return (
    <Feed>
      <div className="organizations-container">
        <div className="organizations-header">
          <div className="organizations-info">
            <h2>Descoperă organizații</h2>
            <p>Găsește și urmărește organizațiile care te interesează</p>
          </div>
        </div>

        <div className="organizations-search">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Caută organizații..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="organizations-stats">
          <span className="stats-text">
            {searchTerm ? (
              <>
                {sortedOrganizations.length} din {organizations.length} organizații găsite
              </>
            ) : (
              <>
                {organizations.length} organizații disponibile
              </>
            )}
          </span>
        </div>

        {sortedOrganizations.length === 0 ? (
          <div className="no-organizations">
            {searchTerm ? (
              <div className="no-results">
                <h3>Nu s-au găsit rezultate</h3>
                <p>Nu există organizații care să corespundă cu "{searchTerm}"</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSearchTerm('')}
                >
                  Șterge filtrul
                </button>
              </div>
            ) : (
              <div className="no-organizations-available">
                <h3>Nu există organizații</h3>
                <p>Încă nu sunt înregistrate organizații în platformă.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="organizations-grid">
            {sortedOrganizations.map(organization => (
              <Organization 
                key={organization.org_id} 
                organization={organization} 
              />
            ))}
          </div>
        )}
      </div>
    </Feed>
  );
};

export default OrganizationsList;