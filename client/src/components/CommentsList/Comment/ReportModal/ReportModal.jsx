import React, { useEffect, useRef } from 'react';
import './ReportModal.css';

const ReportModal = ({ isOpen, onClose, onSubmit }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };
  
  return (
    <div className="report-modal">
      <div className="report-modal-content" ref={modalRef}>
        <h4>Raportează comentariul</h4>
        <div className="report-modal-actions">
          <button onClick={onClose} className="btn-cancel">Anulează</button>
          <button onClick={handleSubmit} className="btn-submit">Raportează</button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;