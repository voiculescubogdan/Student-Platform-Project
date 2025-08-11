import React, { useState } from 'react';
import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import useModerationActions from '../../hooks/useModerationActions';
import './ModerationActions.css';

const ModerationActions = ({ postId, onModerationComplete }) => {
  const { 
    acceptPost, 
    rejectPost, 
    isProcessing, 
    error, 
    clearError 
  } = useModerationActions();
  
  const [showConfirmation, setShowConfirmation] = useState(null);
  
  const handleAccept = async () => {
    const result = await acceptPost(postId);
    if (result.success && onModerationComplete) {
      onModerationComplete(result.action, result.data);
    }
    setShowConfirmation(null);
  };
  
  const handleReject = async () => {
    const result = await rejectPost(postId);
    if (result.success && onModerationComplete) {
      onModerationComplete(result.action, result.data);
    }
    setShowConfirmation(null);
  };
  
  const showConfirmDialog = (action) => {
    clearError();
    setShowConfirmation(action);
  };
  
  const cancelConfirmation = () => {
    setShowConfirmation(null);
    clearError();
  };
  
  return (
    <div className="moderation-actions">
      <div className="moderation-header">
        <h3>Acțiuni de moderare</h3>
        <p>Această postare necesită aprobarea ta ca moderator</p>
      </div>
      
      {error && (
        <div className="moderation-error">
          <p>{error}</p>
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={clearError}
          >
            Închide
          </button>
        </div>
      )}
      
      {!showConfirmation ? (
        <div className="moderation-buttons">
          <button
            className="btn btn-success moderation-btn"
            onClick={() => showConfirmDialog('accept')}
            disabled={isProcessing}
          >
            <FaCheck className="me-2" />
            Acceptă postarea
          </button>
          
          <button
            className="btn btn-danger moderation-btn"
            onClick={() => showConfirmDialog('reject')}
            disabled={isProcessing}
          >
            <FaTimes className="me-2" />
            Respinge postarea
          </button>
        </div>
      ) : (
        <div className="moderation-confirmation">
          <div className="confirmation-message">
            <p>
              {showConfirmation === 'accept' 
                ? 'Ești sigur că vrei să accepți această postare? Aceasta va deveni vizibilă pentru toți utilizatorii.'
                : 'Ești sigur că vrei să respingi această postare? Aceasta va fi eliminată permanent.'
              }
            </p>
          </div>
          
          <div className="confirmation-buttons">
            <button
              className="btn btn-secondary"
              onClick={cancelConfirmation}
              disabled={isProcessing}
            >
              Anulează
            </button>
            
            <button
              className={`btn ${showConfirmation === 'accept' ? 'btn-success' : 'btn-danger'}`}
              onClick={showConfirmation === 'accept' ? handleAccept : handleReject}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="me-2 spinner" />
                  Se procesează...
                </>
              ) : (
                <>
                  {showConfirmation === 'accept' ? <FaCheck className="me-2" /> : <FaTimes className="me-2" />}
                  Confirmă {showConfirmation === 'accept' ? 'acceptarea' : 'respingerea'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationActions;