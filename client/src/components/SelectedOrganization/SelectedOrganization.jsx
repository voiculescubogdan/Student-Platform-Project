import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelectedOrganization } from '../../hooks/useOrganization';
import PostsList from '../PostsList/PostsList';
import PostStore from '../../state/stores/PostStore';
import Feed from '../Feed/Feed';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { FaUsers, FaHeart, FaRegHeart } from 'react-icons/fa';
import './SelectedOrganization.css';

const SelectedOrganization = () => {
  const { oid } = useParams();
  const {
    organization,
    isFollowing,
    loading,
    error,
    toggleFollow
  } = useSelectedOrganization(oid);

  if (loading) {
    return (
      <Feed>
        <LoadingSpinner message="Se încarcă organizația..." />
      </Feed>
    );
  }

  if (error) {
    return (
      <Feed title="Eroare">
        <div className="organization-error">
          <div className="alert alert-danger">
            <h4>A apărut o eroare</h4>
            <p>{error}</p>
          </div>
        </div>
      </Feed>
    );
  }

  if (!organization) {
    return (
      <Feed title="Organizație negăsită">
        <div className="organization-not-found">
          <div className="alert alert-warning">
            <h4>Organizația nu a fost găsită</h4>
            <p>Organizația pe care o cauți nu există sau a fost eliminată.</p>
          </div>
        </div>
      </Feed>
    );
  }

  const fetchOrganizationPosts = (params) => {
    return PostStore.getOrganizationPosts(oid, params);
  };

  return (
    <Feed>
      <div className="selected-organization-container">
        <div className="organization-header-section">
          <div className="organization-title-section">
            <h1 className="organization-title">{organization.name}</h1>
            <p className="organization-description">{organization.description}</p>
          </div>
          
          <div className="organization-actions-section">
            <div className="organization-stats">
              <div className="stat-item">
                <FaUsers className="stat-icon" />
                <span>{organization.members_count || 0} membri</span>
              </div>
            </div>
            
            <div className="organization-actions">
              <button
                className={`btn ${isFollowing ? 'btn-danger' : 'btn-primary'} follow-btn`}
                onClick={toggleFollow}
              >
                {isFollowing ? (
                  <>
                    <FaHeart className="me-2" />
                    Urmărești
                  </>
                ) : (
                  <>
                    <FaRegHeart className="me-2" />
                    Urmărește
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="organization-posts-section">
          <PostsList
            initialFilters={{ status: "active" }}
            fetchPostsFunction={fetchOrganizationPosts}
            emptyMessageText={`${organization.name} nu a publicat încă nicio postare.`}
            showOnlyFollowedOrgs={false}
            pageSize={5}
          />
        </div>
      </div>
    </Feed>
  );
};

export default SelectedOrganization;