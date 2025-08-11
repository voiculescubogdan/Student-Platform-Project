import "./PostContent.css"
import React, { useState } from 'react';
import PostSlideshow from '../PostSlideshow/PostSlideshow';
import { propagationHandler } from "../../../../utils/propagationClickUtil";

export default function PostContent({ description, postmedia, title }) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const needsTruncation = description && description.length > 50;
  const truncatedDescription = needsTruncation
    ? `${description.substring(0, 50)}...` 
    : description;

  const handleReadMoreClick = propagationHandler(() => {
    setShowFullDescription(!showFullDescription);
  });

  return (
    <div className="post-content">
      <p className={`post-description ${showFullDescription ? 'expanded' : ''}`}>
        {showFullDescription ? description : truncatedDescription}
      </p>

      {needsTruncation && (
        <button 
          className="read-more-button"
          onClick={handleReadMoreClick}
        >
          {showFullDescription ? 'Arată mai puțin' : 'Citește mai mult'}
        </button>
      )}
      
      {postmedia && postmedia.length > 0 && (
        <PostSlideshow 
          postmedia={postmedia} 
          title={title} 
          stopPropagation={true}
        />
      )}
    </div>
  );
}