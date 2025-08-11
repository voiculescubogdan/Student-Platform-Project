export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ro-RO', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

export const sortMediaById = (mediaArray) => {
  if (!mediaArray || !Array.isArray(mediaArray)) return [];
  return [...mediaArray].sort((a, b) => a.media_id - b.media_id);
};

export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};