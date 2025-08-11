import React from 'react';
import './CommentContent.css';

const CommentContent = ({ content }) => {
  return (
    <div className="comment-content">
      {content}
    </div>
  );
};

export default CommentContent;