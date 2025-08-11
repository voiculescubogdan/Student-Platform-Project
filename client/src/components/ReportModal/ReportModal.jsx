import React from 'react';
import './ReportModal.css';

const ReportModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  contentType = 'conținut',
  title = 'Raportează conținut',
  confirmButtonText = 'Raportează',
  cancelButtonText = 'Anulează',
  message = 'Ești sigur că dorești să raportezi acest conținut?'
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit();
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        
        <div className="report-modal-buttons">
          <button 
            type="button" 
            className="report-cancel-button btn btn-outline-danger"
            onClick={onClose}
          >
            {cancelButtonText}
          </button>
          <button 
            type="button" 
            className="report-submit-button btn btn-danger" 
            onClick={handleSubmit}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;