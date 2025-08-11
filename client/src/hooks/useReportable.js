import { useState } from 'react';

export function useReportable(reportFunction, contentId, options = {}) {
  const [showReportModal, setShowReportModal] = useState(false);
  
  const openReportModal = () => {
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
  };

  const submitReport = async () => {
    try {
      await reportFunction(contentId, options);
      closeReportModal();
    } catch (err) {
      console.error("Eroare la raportare:", err);
      alert("A apărut o eroare la raportare!");
    }
  };

  return {
    showReportModal,
    openReportModal,
    closeReportModal,
    submitReport
  };
}