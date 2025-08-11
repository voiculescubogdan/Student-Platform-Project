import './Post.css';
import React from 'react';
import PostHeader from './PostHeader/PostHeader';
import PostContent from './PostContent/PostContent';
import PostActions from './PostActions/PostActions';
import usePostLike from '../../../hooks/usePostLike';
import ReportModal from "../../ReportModal/ReportModal"
import PostStore from "../../../state/stores/PostStore"
import { useAuth } from '../../../hooks/useAuth';

import { useNavigate } from 'react-router-dom';
import { useReportable } from '../../../hooks/useReportable';

export default function Post({ post, isDetailView }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    post_id,
    title, 
    description, 
    created_at, 
    user: postUser,
    organization,
    postmedia: rawPostmedia,
    likes_count = 0,
    comments_count = 0
  } = post;

  const { liked, localLikesCount, handleLikeToggle } = usePostLike(post_id, likes_count);
  const { showReportModal, openReportModal, closeReportModal, submitReport } = useReportable(
    PostStore.reportPost.bind(PostStore), 
    post.post_id
  );

  const isOwner = user && postUser && user.user_id === postUser.user_id;

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/edit-post/${post_id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Ești sigur că vrei să ștergi această postare?')) {
      try {
        await PostStore.deletePost(post_id);
        navigate('/home');
      } catch (error) {
        console.error('Eroare la ștergerea postării:', error);
        alert('Eroare la ștergerea postării. Te rugăm să încerci din nou.');
      }
    }
  };
  
  return (
    <article className={isDetailView ? "detailed-post reddit-post" : "list-post reddit-post"}>
      <PostHeader 
        organization={organization}
        username={postUser?.username}
        userId={postUser?.user_id}
        created_at={created_at}
        isDetailView={isDetailView}
      />
      
      {isDetailView ? (
        <>
          <h2 className="post-title">{title}</h2>
          
          <PostContent 
            description={description}
            postmedia={rawPostmedia}
            title={title}
          />
          
          <PostActions 
            liked={liked}
            localLikesCount={localLikesCount}
            onLikeToggle={handleLikeToggle}
            comments={comments_count}
            stopPropagation={!isDetailView}
            onReport={openReportModal}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isOwner={isOwner}
          />

          <div className="additional-details">
          </div>
        </>
      ) : (
        <div 
          className="post-content-clickable" 
          onClick={() => navigate(`/post/${post_id}`)}
          style={{ cursor: 'pointer' }}
        >
          <h2 className="post-title">{title}</h2>
          
          <PostContent 
            description={description}
            postmedia={rawPostmedia}
            title={title}
          />
          
          <PostActions 
            liked={liked}
            localLikesCount={localLikesCount}
            onLikeToggle={handleLikeToggle}
            comments={comments_count}
            stopPropagation={!isDetailView}
            onReport={openReportModal}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isOwner={isOwner}
          />
        </div>
      )}

      <ReportModal 
        isOpen={showReportModal}
        onClose={closeReportModal}
        onSubmit={submitReport}
        contentType="postare"
        title="Raportează postarea"
        message="Ești sigur că dorești să raportezi această postare?"
      />

    </article>
  );
}