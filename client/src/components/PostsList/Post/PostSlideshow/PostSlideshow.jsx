import "./PostSlideshow.css"
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { SERVER } from "../../../../config/global";
import { propagationHandler } from "../../../../utils/propagationClickUtil";

export default function PostSlideshow({ postmedia: rawPostmedia, title, stopPropagation }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const containerRef = useRef(null);
  
  const postmedia = useMemo(() => {
    if (!rawPostmedia || !Array.isArray(rawPostmedia)) return [];
    
    return [...rawPostmedia].sort((a, b) => a.media_id - b.media_id);
  }, [rawPostmedia]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === postmedia.length - 1 ? 0 : prevIndex + 1);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? postmedia.length - 1 : prevIndex - 1);
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    const container = img.closest('.post-image-container');
    
    if (container) {
      container.style.backgroundImage = `url(${img.src})`;
      container.classList.add('with-background');
    }
  };

  const handlePrevClick = propagationHandler(() => {
    prevImage();
  }, stopPropagation);

  const handleNextClick = propagationHandler(() => {
    nextImage();
  }, stopPropagation);

  useEffect(() => {
    if (postmedia && postmedia.length > 0) {
      const img = new Image();
      img.src = `${SERVER}/${postmedia[currentImageIndex].media_url.replace(/\\/g, '/')}`;
      img.onload = () => {
        if (containerRef.current) {
          containerRef.current.style.backgroundImage = `url(${img.src})`;
          containerRef.current.classList.add('with-background');
        }
      };
    }
  }, [currentImageIndex, postmedia]);
  
  if (!postmedia || postmedia.length === 0) {
    return null;
  }

  return (
    <div className="post-image-container" ref={containerRef} onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}>
      {postmedia.length > 1 && (
        <button className="slideshow-nav prev" onClick={handlePrevClick}>
          <FaChevronLeft className="slideshow-icon"/>
        </button>
      )}
      
      <div className="slideshow-container">
        <div 
          className="slideshow-track" 
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {postmedia.map((media) => (
            <div key={media.media_id} className="slide">
              <img 
                src={`${SERVER}/${media.media_url.replace(/\\/g, '/')}`} 
                alt={title} 
                className="post-image"
                loading="lazy"
                onLoad={handleImageLoad}
              />
            </div>
          ))}
        </div>
      </div>

      {postmedia.length > 1 && (
        <>
          <button className="slideshow-nav next" onClick={handleNextClick}>
            <FaChevronRight className="slideshow-icon"/>
          </button>
          
          <div className="image-counter">
            {currentImageIndex + 1} / {postmedia.length}
          </div>
        </>
      )}
    </div>
  );
}