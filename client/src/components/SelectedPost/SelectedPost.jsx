import React from 'react';
import { useParams } from 'react-router-dom';
import Post from '../PostsList/Post/Post';
import { usePost } from '../../hooks/usePost';
import './SelectedPost.css';
import Feed from '../Feed/Feed';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import CommentsList from '../CommentsList/CommentsList';
import { useAuth } from '../../hooks/useAuth'
import ModerationActions from '../ModerationActions/ModerationActions';
import ModerationSuccess from '../ModerationActions/ModerationSucces/ModerationSuccess';
import useModerationActions from '../../hooks/useModerationActions';

const SelectedPost = () => {
  const { id } = useParams();
  const { post, loading, error, isAssigned } = usePost(id);
  const { user } = useAuth();

  const {
    showModerationComplete,
    moderationResult,
    canModerate,
    handleModerationComplete
  } = useModerationActions(user, post, isAssigned);

  const handleGoBack = () => {
    window.history.back();
  };

  if (showModerationComplete) {
    return (
      <ModerationSuccess 
        moderationResult={moderationResult}
        onGoBack={handleGoBack}
      />
    );
  }

  if (loading) return <LoadingSpinner message="Se încarcă postarea..." />
  if (error) return <div className="error-post">{error}</div>;
  if (!post) return <div className="not-found-post">Postarea nu a fost găsită</div>;

  return (
    <Feed>
        <div className="selected-post-container">
            <Post post={post} isDetailView={true} />

            {canModerate && (
            <ModerationActions 
              postId={post.post_id || post.id}
              onModerationComplete={handleModerationComplete}
            />
            )}
            
            <div className="post-comments-section">
                <h3>Comentarii ({post.comments_count || 0})</h3>
                <CommentsList postId={post.post_id} />
            </div>
        </div>
    </Feed>
  );
};

export default SelectedPost;