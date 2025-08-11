import React from 'react';
import { formatDistance } from 'date-fns';
import { ro } from 'date-fns/locale';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './CommentHeader.css';

const CommentHeader = ({ comment, isCollapsed, toggleCollapse }) => {
  const timeAgo = formatDistance(new Date(comment.created_at), new Date(), { 
    addSuffix: true,
    locale: ro 
  });

  return (
    <div className="comment-header">
      <div className="comment-user-info">
        <div className="comment-avatar">
          {comment.username.charAt(0).toUpperCase()}
        </div>
        <div className="comment-metadata">
          <span className="comment-username">{comment.username}</span>
          <span className="comment-time"> · {timeAgo}</span>
        </div>
      </div>
      
      <button 
        className="btn-collapse" 
        onClick={toggleCollapse}
        aria-label={isCollapsed ? "Extinde comentariul" : "Restrânge comentariul"}
      >
        {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
      </button>
    </div>
  );
};

export default CommentHeader;