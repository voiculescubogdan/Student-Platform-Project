import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import useNotificationStore from '../../state/stores/NotificationStore';
import useNotificationMark from '../../hooks/useNotificationMark';
import Notification from './Notification/Notification';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import './NotificationsList.css';

const CATEGORIES = {
  GENERAL: 'general',
  ASSIGNED: 'assigned',
  REPORTS: 'reports'
};

const NotificationsList = observer(() => {
  const { notifications, loading, error, fetchNotifications } = useNotificationStore();
  const { handleMarkAllAsRead, isMarking } = useNotificationMark();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES.GENERAL);
  
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  const unreadCount = user?.notifications_count || 0;
  
  const markAllRead = async () => {
    await handleMarkAllAsRead();
  };
  
  const getFilteredNotifications = () => {
    if (loading || !notifications) return [];
    
    switch (activeCategory) {
      case CATEGORIES.ASSIGNED:
        return notifications.filter(
          notification => 
            notification.type === 'pending_post' && 
            notification.user_id === user?.user_id
        );
      case CATEGORIES.REPORTS:
        return notifications.filter(
          notification => 
            (notification.type === 'report') && 
            notification.user_id === user?.user_id
        );
      case CATEGORIES.GENERAL:
      default:
        return notifications.filter(
          notification => 
            !['pending_post', 'report'].includes(notification.type) || 
            notification.user_id !== user?.user_id
        );
    }
  };
  
  const isModerator = user?.user_type === 'Moderator' || user?.user_type === 'Administrator';
  
  const filteredNotifications = getFilteredNotifications();
  
  const getUnreadCountForCategory = (category) => {
    if (loading || !notifications) return 0;
    
    let filteredNotifs = [];
    
    switch (category) {
      case CATEGORIES.ASSIGNED:
        filteredNotifs = notifications.filter(
          notification => 
            notification.type === 'pending_post' && 
            notification.user_id === user?.user_id
        );
        break;
      case CATEGORIES.REPORTS:
        filteredNotifs = notifications.filter(
          notification => 
            (notification.type === 'report') && 
            notification.user_id === user?.user_id
        );
        break;
      case CATEGORIES.GENERAL:
      default:
        filteredNotifs = notifications.filter(
          notification => 
            !['pending_post', 'report'].includes(notification.type) || 
            notification.user_id !== user?.user_id
        );
    }
    
    return filteredNotifs.filter(notification => !notification.read).length;
  };
  
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };
  
  return (
    <>
      <h1 className="mb-4 mt-4">Notificări</h1>
      <div className="notifications-container">
        <div className="notifications-header">
          <div className="notifications-tabs">
            <button
              className={`notification-tab-btn ${
                activeCategory === CATEGORIES.GENERAL ? "active" : ""
              }`}
              onClick={() => handleCategoryChange(CATEGORIES.GENERAL)}
            >
              General
              {getUnreadCountForCategory(CATEGORIES.GENERAL) > 0 && (
                <span className="notification-badge">
                  {getUnreadCountForCategory(CATEGORIES.GENERAL)}
                </span>
              )}
            </button>

            {isModerator && (
              <>
                <button
                  className={`notification-tab-btn ${
                    activeCategory === CATEGORIES.ASSIGNED ? "active" : ""
                  }`}
                  onClick={() => handleCategoryChange(CATEGORIES.ASSIGNED)}
                >
                  Asignate
                  {getUnreadCountForCategory(CATEGORIES.ASSIGNED) > 0 && (
                    <span className="notification-badge">
                      {getUnreadCountForCategory(CATEGORIES.ASSIGNED)}
                    </span>
                  )}
                </button>

                <button
                  className={`notification-tab-btn ${
                    activeCategory === CATEGORIES.REPORTS ? "active" : ""
                  }`}
                  onClick={() => handleCategoryChange(CATEGORIES.REPORTS)}
                >
                  Report-uri
                  {getUnreadCountForCategory(CATEGORIES.REPORTS) > 0 && (
                    <span className="notification-badge">
                      {getUnreadCountForCategory(CATEGORIES.REPORTS)}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          <div className="notifications-actions">
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={markAllRead}
                disabled={isMarking || loading}
              >
                Marchează toate ca citite
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Se încarcă notificările..." />
        ) : error ? (
          <div className="notifications-error">
            <p>A apărut o eroare la încărcarea notificărilor.</p>
            <button className="retry-btn" onClick={fetchNotifications}>
              Încearcă din nou
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <p>
              {activeCategory === CATEGORIES.GENERAL
                ? "Nu ai nicio notificare momentan."
                : activeCategory === CATEGORIES.ASSIGNED
                ? "Nu ai postări asignate momentan."
                : "Nu ai report-uri asignate momentan."}
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <Notification
                key={notification.notification_id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
});

export default NotificationsList;