import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaImage, FaFileUpload, FaTimes, FaPlus } from 'react-icons/fa';
import axios from '../../utils/setupAxios';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './CreatePost.css';
import Feed from '../Feed/Feed';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
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
    const totalImages = mediaFiles.length + selectedFiles.length;
    
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
  
  const handleRemoveMedia = (mediaId) => {
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
  
  React.useEffect(() => {
    return () => {
      mediaFiles.forEach(media => {
        URL.revokeObjectURL(media.previewUrl);
      });
    };
  }, [mediaFiles]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validare de bază
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
      formData.append('title', title);
      formData.append('description', description);
      
      mediaFiles.forEach((mediaItem, index) => {
        formData.append('media', mediaItem.file);
      });
      
      await axios.post('/api/users/posts/create-post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Eroare la crearea postării:', error);
      setError(
        error.response?.data?.message || 
        'A apărut o eroare la crearea postării. Te rugăm să încerci din nou.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoBack = () => {
    navigate('/home');
  };
  
  if (isSubmitted) {
    return (
      <Feed>
        <div className="create-post-success">
          <h1>Postarea este în verificare, vei primi o notificare când procesul s-a terminat</h1>
          <button 
            className="btn btn-primary"
            onClick={handleGoBack}
          >
            Înapoi
          </button>
        </div>
      </Feed>
    );
  }
  
  return (
    <Feed>
      <div className="create-post-container">
        <div className="create-post-header">
          <h1>Creează o postare nouă</h1>
          <p>Completează informațiile și trimite-le pentru evaluare</p>
        </div>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form className="create-post-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titlu</label>
            <input
              type="text"
              id="title"
              className="form-control"
              value={title}
              onChange={handleTitleChange}
              placeholder="Introdu titlul postării"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descriere</label>
            <textarea
              id="description"
              className="form-control"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Introdu descrierea postării"
              rows={6}
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Adaugă imagini (opțional, maxim 5)</label>
            
            {mediaFiles.length > 0 && (
              <div className="media-previews-grid">
                {mediaFiles.map(media => (
                  <div key={media.id} className="media-preview-item">
                    <img src={media.previewUrl} alt="Preview" className="media-preview" />
                    <button 
                      type="button" 
                      className="remove-media-btn"
                      onClick={() => handleRemoveMedia(media.id)}
                      disabled={isSubmitting}
                      aria-label="Elimină imaginea"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
                
                {mediaFiles.length < 5 && (
                  <label htmlFor="media" className="add-more-media-btn">
                    <FaPlus />
                    <span>Adaugă încă</span>
                    <input
                      type="file"
                      id="media"
                      accept="image/*"
                      onChange={handleMediaChange}
                      disabled={isSubmitting}
                      hidden
                      multiple
                    />
                  </label>
                )}
              </div>
            )}
            
            {mediaFiles.length === 0 && (
              <div className="media-upload-container">
                <label htmlFor="media" className="media-upload-label">
                  <FaImage className="media-upload-icon" />
                  <span>Selectează una sau mai multe imagini</span>
                  <input
                    type="file"
                    id="media"
                    accept="image/*"
                    onChange={handleMediaChange}
                    disabled={isSubmitting}
                    hidden
                    multiple
                  />
                </label>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary ctm-btn"
              onClick={handleGoBack}
              disabled={isSubmitting}
            >
              Anulează
            </button>
            
            <button 
              type="submit" 
              className="btn btn-primary ctm-btn"
              disabled={isSubmitting}
            >

              <FaFileUpload className="me-2" />
              <span>Trimite postarea</span>

            </button>
          </div>

          {isSubmitting ? (
            <LoadingSpinner size="sm" />
          ): null}

        </form>
      </div>
    </Feed>
  );
};

export default CreatePost;