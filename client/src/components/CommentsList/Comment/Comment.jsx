import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useAuth } from '../../../hooks/useAuth';
import CommentHeader from './CommentHeader/CommentHeader';
import CommentContent from './CommentContent/CommentContent';
import CommentActions from './CommentActions/CommentActions';
import CommentStore from '../../../state/stores/CommentStore';
import ReportModal from "../../../components/ReportModal/ReportModal"
import useCommentLike from "../../../hooks/useCommentLike"
import { useReportable } from '../../../hooks/useReportable';
import { FaSave, FaTimes } from 'react-icons/fa';
import './Comment.css';

const Comment = observer(({ comment, postId, onReply, level }) => {

  const { liked, localLikesCount, handleLikeToggle } = useCommentLike(comment.comment_id, postId, comment.likes_count);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment_text);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleReply = (commentId, username) => {
    onReply(commentId, username);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(comment.comment_text);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(comment.comment_text);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await CommentStore.editComment(comment.comment_id, postId, editText.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Eroare la editarea comentariului:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Ești sigur că vrei să ștergi acest comentariu?')) {
      try {
        await CommentStore.deleteComment(comment.comment_id, postId);
      } catch (error) {
        console.error('Eroare la ștergerea comentariului:', error);
      }
    }
  };

  const { showReportModal, openReportModal, closeReportModal, submitReport } = useReportable(
    CommentStore.reportComment.bind(CommentStore), 
    comment.comment_id,
    { postId }
  );

  return (
    <div className={`comment-container ${level > 0 ? 'comment-reply' : ''}`}>
      {level > 0 && <div className="comment-thread-line" />}
      
      <div className="comment">
        <CommentHeader 
          comment={comment} 
          isCollapsed={isCollapsed} 
          toggleCollapse={toggleCollapse} 
        />
        
        {!isCollapsed && (
          <>
            {isEditing ? (
              <div className="comment-edit">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="comment-edit-textarea"
                  rows={3}
                  disabled={isLoading}
                />
                <div className="comment-edit-actions">
                  <button 
                    className="btn btn-save" 
                    onClick={handleSaveEdit}
                    disabled={isLoading || !editText.trim()}
                  >
                    <FaSave /> {isLoading ? 'Se salvează...' : 'Salvează'}
                  </button>
                  <button 
                    className="btn btn-cancel" 
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                  >
                    <FaTimes /> Anulează
                  </button>
                </div>
              </div>
            ) : (
              <CommentContent content={comment.comment_text} />
            )}
            
            <CommentActions 
              liked={liked}
              localLikesCount={localLikesCount}
              handleLikeToggle={handleLikeToggle}
              comment={comment} 
              postId={postId}
              onReply={() => handleReply(comment.comment_id, comment.username)}
              onReport={openReportModal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAuthenticated={isAuthenticated}
              currentUserId={user?.user_id}
            />
          </>
        )}
      </div>
      
      {!isCollapsed && comment.children && comment.children.length > 0 && (
        <div className={`comment-replies ${level > 0 ? 'nested-replies' : ''}`}>
          {comment.children.map(childComment => (
            <Comment
              key={childComment.comment_id}
              comment={childComment}
              postId={postId}
              onReply={onReply}
              level={level + 1}
            />
          ))}
        </div>
      )}
      
      <ReportModal 
        isOpen={showReportModal}
        onClose={closeReportModal}
        onSubmit={submitReport}
        contentType="comentariu"
        title="Raportează comentariul"
        message="Ești sigur că dorești să raportezi acest comentariu?"
      />
    </div>
  );
});

export default Comment;