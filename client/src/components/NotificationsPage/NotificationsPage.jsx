import "./NotificationsPage.css"
import React from 'react';
import Feed from "../Feed/Feed";
import NotificationsList from "../NotificationsList/NotificationsList";

const NotificationsPage = () => {
  return (
    <Feed>
      <NotificationsList />
    </Feed>
  )

}

export default NotificationsPage;