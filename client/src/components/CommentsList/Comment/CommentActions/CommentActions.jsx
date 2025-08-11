import React from 'react';
import { FaThumbsUp, FaReply, FaFlag, FaEdit, FaTrash } from 'react-icons/fa';
import './CommentActions.css';
import ActionButton from '../../../ActionButton/ActionButton';

const CommentActions = ({ 
  liked, 
  localLikesCount, 
  handleLikeToggle, 
  comment, 
  onReply, 
  onReport, 
  onEdit,
  onDelete,
  isAuthenticated,
  currentUserId 
}) => {
  const isOwner = currentUserId && comment.user?.user_id === currentUserId;

  return (
    <div className="comment-actions">
      <ActionButton
        icon={FaThumbsUp}
        count={localLikesCount}
        active={liked}
        onClick={handleLikeToggle}
        disabled={!isAuthenticated}
        stopPropagation={true}
      />
      
      <ActionButton
        icon={FaReply}
        text="Răspunde"
        onClick={() => onReply(comment.comment_id, comment.username)}
        disabled={!isAuthenticated}
        stopPropagation={true}
      />
      
      {isOwner && (
        <>
          <ActionButton
            className="edit"
            icon={FaEdit}
            text="Editează"
            onClick={onEdit}
            stopPropagation={true}
          />
          
          <ActionButton
            className="delete"
            icon={FaTrash}
            text="Șterge"
            onClick={onDelete}
            stopPropagation={true}
          />
        </>
      )}
      
      <ActionButton
        className="report"
        icon={FaFlag}
        text="Raportează"
        onClick={onReport}
        disabled={!isAuthenticated}
        stopPropagation={true}
      />
    </div>
  );
};

CommentActions.defaultProps = {
  comment: {},
  onReply: () => {},
  onReport: () => {},
  onEdit: () => {},
  onDelete: () => {},
  isAuthenticated: false,
  currentUserId: null
};

export default CommentActions;