import React from 'react';

const LaunchCard = ({ launch }) => {
  return (
    <div className="launch-card">
      <img
        className="launch-image"
        src={launch.links.mission_patch_small || 'https://via.placeholder.com/300x200?text=No+Image'}
        alt={launch.mission_name}
      />
      <div className="launch-details">
        <h3 className="launch-title">{launch.mission_name}</h3>
        <p className="launch-date">
          {new Date(launch.launch_date_utc).toLocaleDateString()}
        </p>
        <span className={`launch-success ${launch.launch_success ? 'success' : 'failure'}`}>
          {launch.launch_success ? 'Success' : 'Failure'}
        </span>
      </div>
    </div>
  );
};

export default LaunchCard;