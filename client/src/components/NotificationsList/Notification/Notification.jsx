import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import './Notification.css';
import useNotificationMark from '../../../hooks/useNotificationMark';
import { 
  FaComment, 
  FaThumbsUp, 
  FaReply, 
  FaFire, 
  FaHourglassHalf,
  FaInfo,
  FaFlag,
  FaBell
} from 'react-icons/fa';

const Notification = ({ notification }) => {
  const { handleMarkAsRead, isMarking } = useNotificationMark();
  
  const formattedDate = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: ro
  });
  
  const handleClick = async () => {
    if (!notification.read) {
      await handleMarkAsRead(notification.notification_id);
    }
  };
  
  const getNotificationLink = () => {
    switch (notification.type) {
      case 'like':
        return `/post/${notification.post_id}`
      case 'comment':
        return `/post/${notification.post_id}`;
      case 'reply':
        return `/post/${notification.post_id}`;
      case 'new_post':
        return `/post/${notification.post_id}`;
      case 'pending_post':
        return `/post/${notification.post_id}`;
      case 'status_change':
        return `/post/${notification.post_id}`;
      case 'report':
        return `/post/${notification.post_id}`;
      case 'system':
      default:
        return '#';
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'like':
        return <FaThumbsUp className="notification-icon-symbol" />;
      case 'comment':
        return <FaComment className="notification-icon-symbol" />;
      case 'reply':
        return <FaReply className="notification-icon-symbol" />;
      case 'new_post':
        return <FaFire className="notification-icon-symbol" />;
      case 'pending_post':
        return <FaHourglassHalf className="notification-icon-symbol" />;
      case 'status_change':
        return <FaInfo className="notification-icon-symbol" />;
      case 'report':
        return <FaFlag className="notification-icon-symbol" />;
      case 'system':
      default:
        return <FaBell className="notification-icon-symbol" />;
    }
  };
  
  const notificationClass = `notification ${notification.read ? 'read' : 'unread'}`;
  
  return (
    <Link 
      to={getNotificationLink()} 
      className={notificationClass}
      onClick={handleClick}
      aria-disabled={isMarking}
    >
      <div className="notification-icon">
        {getNotificationIcon()}
      </div>
      
      <div className="notification-content">
        <p className="notification-message">{notification.content}</p>
        <span className="notification-time">{formattedDate}</span>
      </div>
      
      {!notification.read && <div className="notification-indicator"></div>}
    </Link>
  );
};

export default Notification;