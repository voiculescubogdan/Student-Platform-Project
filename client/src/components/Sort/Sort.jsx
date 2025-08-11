import React, { useState, useEffect } from 'react';
import './Sort.css';

function Sort({ sortOrder, onSortChange }) {
  const [localSort, setLocalSort] = useState(sortOrder || "newest");

  useEffect(() => {
    setLocalSort(sortOrder || "newest");
  }, [sortOrder]);

  const sortOptions = [
    { value: "newest", label: "Cele mai noi" },
    { value: "oldest", label: "Cele mai vechi" }
  ];

  const applySorting = () => {
    onSortChange(localSort);
  };

  const getSortText = () => {
    const option = sortOptions.find(opt => opt.value === sortOrder);
    return option ? option.label : "Sortează";
  };

  return (
    <div className="dropdown">
      <button 
        className="sort-main-btn dropdown-toggle" 
        type="button" 
        id="sortDropdown" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
      >
        <span>{getSortText()}</span>
      </button>
      
      <div className="dropdown-menu sort-dropdown-menu" aria-labelledby="sortDropdown">
        <div className="sort-header">
          <h6 className="sort-title">Sortează după</h6>
        </div>
        
        <div className="sort-content">
          <div className="sort-options-list">
            {sortOptions.map((option) => (
              <div className="sort-option-item" key={option.value}>
                <label className="sort-label">
                  <input
                    className="sort-radio"
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={localSort === option.value}
                    onChange={(e) => setLocalSort(e.target.value)}
                  />
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="sort-apply-section">
          <button 
            className="sort-apply-btn" 
            onClick={applySorting}
          >
            Aplică sortarea
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sort;