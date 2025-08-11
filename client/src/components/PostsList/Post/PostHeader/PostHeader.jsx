import "./PostHeader.css"
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../../../utils/postUtils';

export default function PostHeader({ organization, username, userId, created_at, isDetailView = false }) {
  return (
    <div className="post-header">
      <div className="post-info">
        {organization?.org_id ? (
          <Link 
            to={`/organization/${organization.org_id}`} 
            className="organization clickable"
            onClick={(e) => e.stopPropagation()}
          >
            {organization.name}
          </Link>
        ) : (
          <span className="organization">{organization?.name || 'Nicio organizație'}</span>
        )}
        
        <span className="separator">•</span> 
        
        <span className="author">
          Postat de {userId ? (
            <Link 
              to={`/user/${userId}`} 
              className="username clickable"
              onClick={(e) => e.stopPropagation()}
            >
              {username || 'Anonim'}
            </Link>
          ) : (
            <span>{username || 'Anonim'}</span>
          )}
        </span>
        
        <span className="separator">•</span>
        <span className="date">{formatDate(created_at)}</span>
      </div>
    </div>
  );
}