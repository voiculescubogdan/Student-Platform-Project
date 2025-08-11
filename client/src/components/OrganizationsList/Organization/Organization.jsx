import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaExternalLinkAlt } from 'react-icons/fa';
import './Organization.css';

const Organization = ({ organization }) => {
  const { org_id, name, description, members_count } = organization;

  const truncateDescription = (text, maxLength = 150) => {
    if (!text) return 'Această organizație nu are încă o descriere.';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const formatMembersCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="organization-card">
      <div className="organization-header">
        <h3 className="organization-name" title={name}>
          {name}
        </h3>
        <Link 
          to={`/organization/${org_id}`}
          className="organization-link"
          aria-label={`Vizitează ${name}`}
        >
          <FaExternalLinkAlt />
        </Link>
      </div>

      <div className="organization-body">
        <p className="organization-description">
          {truncateDescription(description)}
        </p>
      </div>

      <div className="organization-footer">
        <div className="organization-members">
          <FaUsers className="members-icon" />
          <span className="members-count">
            {formatMembersCount(members_count)} membri
          </span>
        </div>
      </div>
    </div>
  );
};

export default Organization;