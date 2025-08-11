import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import Feed from '../Feed/Feed';
import PostsList from '../PostsList/PostsList';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import UserStore from '../../state/stores/UserStore';
import { FaUser, FaCalendarAlt, FaBuilding, FaUserTag, FaBan } from 'react-icons/fa';
import './UserProfile.css';

const UserProfile = observer(() => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserPosts = useCallback(async (params) => {
    try {
      const response = await UserStore.getUserPosts(userId, params);
      return {
        posts: response.posts || [],
        hasNextPage: response.pagination?.hasNextPage || false,
        totalCount: response.totalPostsCount || 0,
        message: response.posts?.length === 0 ? 'Nu există postări pentru acest utilizator.' : undefined
      };
    } catch (err) {
      console.error('Error fetching user posts:', err);
      throw err;
    }
  }, [userId]);

  const isOwnProfile = userId === currentUser?.user_id.toString();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setLoading(false);
        setError('ID utilizator lipsește');
        return;
      }
      
      if (!currentUser) {
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        if (UserStore.data && UserStore.data.user_id && UserStore.data.user_id.toString() === userId) {
          setUser(UserStore.data);
          return;
        }
        
        const response = await UserStore.getUser(userId);
        if (response && response.user) {
          setUser(response.user);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Eroare la încărcarea profilului');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, currentUser, isOwnProfile]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case 'Administrator': return '#e74c3c';
      case 'Moderator': return '#f39c12';
      case 'Membru': return '#3498db';
      case 'Student': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <Feed>
        <LoadingSpinner message="Se încarcă profilul..." />
      </Feed>
    );
  }

  if (error) {
    return (
      <Feed>
        <div className="user-profile-error">
          <h2>Eroare</h2>
          <p>{error}</p>
        </div>
      </Feed>
    );
  }

  if (!user) {
    return (
      <Feed>
        <div className="user-profile-error">
          <h2>Utilizatorul nu a fost găsit</h2>
          <p>Utilizatorul pe care îl cauți nu există sau a fost șters.</p>
        </div>
      </Feed>
    );
  }

  return (
    <Feed>
      <div className="user-profile">
        <div className="user-info-card">
          <div className="user-info-main">
            <div className="user-avatar">
              {user.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <h2 className="username">{user.username}</h2>
              <p className="email">{user.email}</p>
              {user.banned && (
                <div className="user-status banned">
                  <FaBan className="status-icon" />
                  <span>Utilizator banat</span>
                </div>
              )}
            </div>
          </div>

          <div className="user-info-grid">
            <div className="info-item">
              <FaUserTag className="info-icon" />
              <div className="info-content">
                <span className="info-label">Rol</span>
                <span 
                  className="info-value user-type"
                  style={{ color: getUserTypeColor(user.user_type) }}
                >
                  {user.user_type}
                </span>
              </div>
            </div>

            <div className="info-item">
              <FaBuilding className="info-icon" />
              <div className="info-content">
                <span className="info-label">Organizația</span>
                <span className="info-value">
                  {user.organization ? user.organization.name : 'Nu aparține unei organizații'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="user-posts-section">
          <PostsList 
            fetchPostsFunction={fetchUserPosts}
            emptyMessageText={
              isOwnProfile 
                ? 'Nu ai încă nicio postare activă.' 
                : `${user?.username || 'Utilizatorul'} nu are încă postări active.`
            }
            pageTitle={`Postările lui ${user?.username || 'Utilizator'}`}
            pageSize={5}
          />
        </div>
      </div>
    </Feed>
  );
});

export default UserProfile;
