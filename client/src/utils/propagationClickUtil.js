export const propagationHandler = (callback, shouldStop = true) => {
  return (e) => {
    if (shouldStop) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (typeof callback === 'function') {
      callback(e);
    }
  };
};