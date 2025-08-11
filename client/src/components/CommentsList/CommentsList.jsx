import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import Comment from './Comment/Comment';
import CommentStore from '../../state/stores/CommentStore';
import { useAuth } from '../../hooks/useAuth';
import './CommentsList.css';
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner"

const CommentsList = observer(({ postId }) => {
  const [newCommentContent, setNewCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyingToUsername, setReplyingToUsername] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const commentInputRef = useRef(null);
  const formContainerRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (postId) {
      CommentStore.getCommentsByPostId(postId);
    }
  }, [postId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formContainerRef.current && 
          !formContainerRef.current.contains(event.target) && 
          isExpanded && 
          !replyingTo &&
          !newCommentContent.trim()) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, replyingTo, newCommentContent]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Trebuie să fii autentificat pentru a comenta!');
      return;
    }
    
    if (newCommentContent.trim()) {
      try {
        setIsSubmitting(true);
        await CommentStore.addComment(postId, newCommentContent, replyingTo);
        setNewCommentContent('');
        setReplyingTo(null);
        setReplyingToUsername('');
        setIsExpanded(false);
      } catch (error) {
        console.error('Eroare la adăugarea comentariului:', error);
        alert('Nu s-a putut adăuga comentariul. Te rugăm să încerci din nou.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReply = (commentId, username) => {
    if (!isAuthenticated) {
      alert('Trebuie să fii autentificat pentru a răspunde!');
      return;
    }
    
    setReplyingTo(commentId);
    setReplyingToUsername(username);
    setNewCommentContent(`@${username} `);
    setIsExpanded(true);
    
    if (commentInputRef.current) {
      commentInputRef.current.focus();
      
      setTimeout(() => {
        commentInputRef.current.selectionStart = commentInputRef.current.value.length;
        commentInputRef.current.selectionEnd = commentInputRef.current.value.length;
      }, 0);
    }
    
    const formElement = document.querySelector('.comment-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyingToUsername('');
    setNewCommentContent('');
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setNewCommentContent('');
    setReplyingTo(null);
    setReplyingToUsername('');
  };

  return (
    <div className="comments-section">
      <div 
        ref={formContainerRef}
        className={`comment-form-container ${isExpanded ? 'expanded' : ''}`}
      >
        <form className="comment-form" onSubmit={handleAddComment}>
          {replyingTo && (
            <div className="replying-to">
              <span>Răspunzi la comentariul lui <strong>{replyingToUsername}</strong></span>
              <button type="button" className="btn-cancel" onClick={cancelReply}>
                Anulează
              </button>
            </div>
          )}
          
          <div className="comment-input-wrapper">
            <textarea
              ref={commentInputRef}
              id="comment-input"
              className="comment-input"
              placeholder={isAuthenticated ? "Alătură-te conversației" : "Autentifică-te pentru a comenta"}
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              onFocus={handleFocus}
              disabled={!isAuthenticated || isSubmitting}
              required
            />
            
            {isExpanded && (
              <div className="comment-actions">
                <div className="button-spacer"></div>
                <div className="comment-form-buttons">
                  <button 
                    type="button" 
                    className="btn-cancel-comment"
                    onClick={handleCancel}
                  >
                    Anulează
                  </button>
                  <button 
                    type="submit" 
                    className="btn-comment"
                    disabled={!isAuthenticated || !newCommentContent.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Se trimite...' : 'Comentează'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="comments-list">
        {CommentStore.loading && CommentStore.comments.length === 0 ? (
          <div className="comments-loading"><LoadingSpinner message='Se încarcă comentariile...'/></div>
          
        ) : CommentStore.error ? (
          <div className="comments-error">
            <p>A apărut o eroare la încărcarea comentariilor.</p>
            <button 
              className="btn-retry" 
              onClick={() => CommentStore.getCommentsByPostId(postId)}
            >
              Încearcă din nou
            </button>
          </div>
        ) : CommentStore.comments.length === 0 ? (
          <p className="no-comments">Niciun comentariu încă. Fii primul care comentează!</p>
        ) : (
          CommentStore.comments.map(comment => (
            <Comment 
              key={comment.comment_id} 
              comment={comment} 
              postId={postId}
              onReply={handleReply}
              level={0}
            />
          ))
        )}
      </div>
    </div>
  );
});

export default CommentsList;