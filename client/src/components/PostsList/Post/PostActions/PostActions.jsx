import "./PostActions.css"
import React from 'react';
import { FaThumbsUp, FaComment, FaFlag, FaEdit, FaTrash } from 'react-icons/fa';
import ActionButton from "../../../ActionButton/ActionButton";

export default function PostActions({ 
  liked, 
  localLikesCount, 
  comments, 
  onLikeToggle, 
  stopPropagation, 
  onReport,
  onEdit,
  onDelete,
  isOwner 
}) {

  return (
    <div className="post-actions">
        <ActionButton
          icon={FaThumbsUp}
          text={localLikesCount === 1 ? "Like" : "Like-uri"}
          count={localLikesCount}
          active={liked}
          onClick={onLikeToggle}
          stopPropagation={stopPropagation}
        />
        
        <ActionButton
          icon={FaComment}
          text={comments === 1 ? "Comentariu" : "Comentarii"}
          count={comments}
          stopPropagation={stopPropagation}
        />
        
        {isOwner && (
          <>
            <ActionButton
              className="edit"
              icon={FaEdit}
              text="Editează"
              onClick={onEdit}
              stopPropagation={stopPropagation}
            />
            
            <ActionButton
              className="delete"
              icon={FaTrash}
              text="Șterge"
              onClick={onDelete}
              stopPropagation={stopPropagation}
            />
          </>
        )}
        
        <ActionButton
          className="report"
          icon={FaFlag}
          text="Raportează"
          onClick={onReport}
          stopPropagation={stopPropagation}
        />
    </div>
  );
}