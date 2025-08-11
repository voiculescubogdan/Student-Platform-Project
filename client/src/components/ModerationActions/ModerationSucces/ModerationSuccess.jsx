import React from 'react';
import Feed from '../../Feed/Feed';
import "./ModerationSuccess.css"

const ModerationSuccess = ({ moderationResult, onGoBack }) => {
  return (
    <Feed title="Moderare completă">
      <div className="moderation-complete">
        <div className="alert alert-success">
          <h4>
            {moderationResult === 'accepted' 
              ? 'Postarea a fost acceptată cu succes!' 
              : 'Postarea a fost respinsă cu succes!'
            }
          </h4>
          <p>
            {moderationResult === 'accepted' 
              ? 'Postarea este acum vizibilă pentru toți utilizatorii.'
              : 'Postarea a fost eliminată și nu mai este vizibilă.'
            }
          </p>
          <button 
            className="btn btn-primary"
            onClick={onGoBack}
          >
            Înapoi la lista de notificări
          </button>
        </div>
      </div>
    </Feed>
  );
};

export default ModerationSuccess;