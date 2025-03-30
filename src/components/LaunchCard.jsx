import React, { useState } from 'react';

const LaunchCard = ({ launch }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Calculate time since launch
  const getTimeSince = (launchDate) => {
    const now = new Date();
    const launch = new Date(launchDate);
    const diffYears = Math.floor((now - launch) / (1000 * 60 * 60 * 24 * 365));
    
    if (diffYears < 1) {
      return 'Less than a year ago';
    } else {
      return `${diffYears} years ago`;
    }
  };
  
  // Format launch status
  const getStatusLabel = () => {
    // For upcoming launches
    if (new Date(launch.launch_date_utc) > new Date()) {
      return <span className="status upcoming">upcoming</span>;
    }
    
    // For past launches
    return <span className="status failed">{launch.launch_success ? 'success' : 'failed'}</span>;
  };
  
  // Get mission details for expanded view
  const getMissionDetails = () => {
    const details = [];
    
    if (launch.details) {
      details.push(launch.details);
    } else {
      // Example details based on your second image
      if (launch.rocket && launch.rocket.first_stage && launch.rocket.first_stage.cores) {
        const core = launch.rocket.first_stage.cores[0];
        if (core) {
          if (core.landing_success === false) {
            details.push('Failed to recover first stage');
          }
        }
      }
      
      if (!launch.launch_success) {
        details.push('Failed to reach orbit');
      }
      
      // Add more fallback details if needed
      if (details.length === 0) {
        details.push(`Launched on ${new Date(launch.launch_date_utc).toLocaleDateString()}`);
      }
    }
    
    return details.join(', ');
  };

  return (
    <div className="launch-card">
      {!expanded ? (
        // Collapsed view - just mission name and status with VIEW button
        <div className="collapsed-card">
          <div className="card-header">
            <h3 className="mission-name">{launch.mission_name}</h3>
            {getStatusLabel()}
          </div>
          <button 
            className="view-button" 
            onClick={() => setExpanded(true)}
          >
            VIEW
          </button>
        </div>
      ) : (
        // Expanded view - full details with HIDE button
        <div className="expanded-card">
          <div className="card-header">
            <h3 className="mission-name">{launch.mission_name}</h3>
            {getStatusLabel()}
          </div>
          
          <div className="card-details">
            <div className="time-and-links">
              <span className="time-since">{getTimeSince(launch.launch_date_utc)} | </span>
              {launch.links.article_link && (
                <a href={launch.links.article_link} className="detail-link">Article</a>
              )}
              {launch.links.article_link && launch.links.video_link && (
                <span> | </span>
              )}
              {launch.links.video_link && (
                <a href={launch.links.video_link} className="detail-link">Video</a>
              )}
            </div>
            
            <div className="mission-details-container">
              {launch.links.mission_patch_small && (
                <div className="mission-patch">
                  <img 
                    src={launch.links.mission_patch_small} 
                    alt={`${launch.mission_name} patch`}
                  />
                </div>
              )}
              
              <div className="mission-info">
                <p className="mission-details">{getMissionDetails()}</p>
              </div>
            </div>
          </div>
          
          <button 
            className="hide-button" 
            onClick={() => setExpanded(false)}
          >
            HIDE
          </button>
        </div>
      )}
    </div>
  );
};

export default LaunchCard;