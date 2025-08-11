import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaImage, FaFileUpload, FaTimes, FaPlus } from 'react-icons/fa';
import axios from '../../utils/setupAxios';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import PostStore from '../../state/stores/PostStore';
import { SERVER } from '../../config/global';
import './EditPost.css';
import Feed from '../Feed/Feed';

const EditPost = () => {
  const { postId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [removedMediaIds, setRemovedMediaIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await PostStore.getPost(postId);
        const post = response.post;
        
        setTitle(post.title || '');
        setDescription(post.description || '');
        setExistingMedia(post.postmedia || []);
      } catch (error) {
        console.error('Eroare la încărcarea postării:', error);
        setError('Postarea nu a putut fi încărcată');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, navigate]);
  
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };
  
  const handleMediaChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length === 0) return;
    
    const maxImages = 5;
    const totalImages = mediaFiles.length + existingMedia.length + selectedFiles.length;
    
    if (totalImages > maxImages) {
      setError(`Poți încărca maximum ${maxImages} imagini.`);
      return;
    }
    
    const newMediaFiles = selectedFiles.map(file => {
      const previewUrl = URL.createObjectURL(file);
      
      return {
        file,
        previewUrl,
        id: Date.now() + Math.random().toString(36).substring(2, 9)
      };
    });
    
    setMediaFiles(prevMediaFiles => [...prevMediaFiles, ...newMediaFiles]);
    setError('');
  };
  
  const handleRemoveNewMedia = (mediaId) => {
    setMediaFiles(prevMediaFiles => 
      prevMediaFiles.filter(media => {
        if (media.id === mediaId) {
          URL.revokeObjectURL(media.previewUrl);
          return false;
        }
        return true;
      })
    );
  };

  const handleRemoveExistingMedia = (mediaId) => {
    setExistingMedia(prev => prev.filter(media => media.media_id !== mediaId));
    setRemovedMediaIds(prev => [...prev, mediaId]);
  };
  
  useEffect(() => {
    return () => {
      mediaFiles.forEach(media => {
        URL.revokeObjectURL(media.previewUrl);
      });
    };
  }, [mediaFiles]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Titlul este obligatoriu');
      return;
    }
    
    if (!description.trim()) {
      setError('Descrierea este obligatorie');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      
      if (removedMediaIds.length > 0) {
        formData.append('removedMediaIds', JSON.stringify(removedMediaIds));
      }
      
      mediaFiles.forEach(media => {
        formData.append('media', media.file);
      });
      
      await PostStore.editPost(postId, formData);
      
      navigate(`/post/${postId}`);
      
    } catch (error) {
      console.error('Eroare la editarea postării:', error);
      setError(error.response?.data?.message || 'A apărut o eroare la editarea postării');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Feed>
        <div className="edit-post-container">
          <LoadingSpinner />
        </div>
      </Feed>
    );
  }
  
  return (
    <Feed>
      <div className="edit-post-container">
        <div className="edit-post-card">
          <div className="edit-post-header">
            <h1>Editează postarea</h1>
            <p>Modifică informațiile postării tale</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="edit-post-form">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Titlu <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={handleTitleChange}
                className="form-input"
                placeholder="Introdu titlul postării..."
                disabled={isSubmitting}
                maxLength={255}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Descriere <span className="required">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                className="form-textarea"
                placeholder="Introdu descrierea postării..."
                rows={6}
                disabled={isSubmitting}
              />
            </div>

            {existingMedia.length > 0 && (
              <div className="form-group">
                <label className="form-label">Media existentă</label>
                <div className="media-preview-grid">
                  {existingMedia.map((media) => (
                    <div key={media.media_id} className="media-preview-item">
                      <img 
                        src={`${SERVER}/${media.media_url}`} 
                        alt="Media existent" 
                        className="media-preview-image"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5QzEwLjM0IDkgOSAxMC4zNCA5IDEyQzkgMTMuNjYgMTAuMzQgMTUgMTIgMTVDMTMuNjYgMTUgMTUgMTMuNjYgMTUgMTJDMTUgMTAuMzQgMTMuNjYgOSAxMiA5WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                          e.target.style.border = '2px dashed #dc3545';
                        }}
                      />
                      <button
                        type="button"
                        className="media-remove-btn"
                        onClick={() => handleRemoveExistingMedia(media.media_id)}
                        disabled={isSubmitting}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <FaImage className="label-icon" />
                Media nouă (opțional)
              </label>
              
              <div className="media-upload-section">
                <input
                  type="file"
                  id="media"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="media-input"
                  disabled={isSubmitting}
                />
                <label htmlFor="media" className="media-upload-btn">
                  <FaFileUpload className="upload-icon" />
                  Alege fișiere
                </label>
              </div>

              {mediaFiles.length > 0 && (
                <div className="media-preview-grid">
                  {mediaFiles.map((media) => (
                    <div key={media.id} className="media-preview-item">
                      <img 
                        src={media.previewUrl} 
                        alt="Preview" 
                        className="media-preview-image"
                      />
                      <button
                        type="button"
                        className="media-remove-btn"
                        onClick={() => handleRemoveNewMedia(media.id)}
                        disabled={isSubmitting}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => navigate(`/post/${postId}`)}
                disabled={isSubmitting}
              >
                Anulează
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !title.trim() || !description.trim()}
              >
                {isSubmitting ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Feed>
  );
};

export default EditPost;
