import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LaunchCard = ({ launch }) => {
    const [expanded, setExpanded] = useState(false);

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

    const getStatusLabel = () => {
        if (new Date(launch.launch_date_utc) > new Date()) {
            return <span className="status upcoming">upcoming</span>;
        }

        const statusClass = launch.launch_success ? 'success' : 'failed';
        return (
            <span className={`status ${statusClass}`}>
                {launch.launch_success ? 'success' : 'failed'}
            </span>
        );
    };

    const getMissionDetails = () => {
        const details = [];

        if (launch.details) {
            details.push(launch.details);
        } else {
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

            if (details.length === 0) {
                details.push(`Launched on ${new Date(launch.launch_date_utc).toLocaleDateString()}`);
            }
        }

        return details.join(', ');
    };

    return (
        <motion.div
            className="launch-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
            <AnimatePresence mode="wait">
                {!expanded ? (
                    <motion.div
                        className="collapsed-card"
                        key="collapsed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="card-header">
                            <h3 className="mission-name">{launch.mission_name}</h3>
                            {getStatusLabel()}
                        </div>
                        <motion.button
                            className="view-button"
                            onClick={() => setExpanded(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            VIEW
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        className="expanded-card"
                        key="expanded"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="card-header">
                            <h3 className="mission-name">{launch.mission_name}</h3>
                            {getStatusLabel()}
                        </div>

                        <div className="card-details">
                            <div className="time-and-links">
                                <span className="time-since">{getTimeSince(launch.launch_date_utc)} | </span>
                                {launch.links.article_link && (
                                    <a href={launch.links.article_link} className="detail-link">
                                        Article
                                    </a>
                                )}
                                {launch.links.article_link && launch.links.video_link && <span> | </span>}
                                {launch.links.video_link && (
                                    <a href={launch.links.video_link} className="detail-link">
                                        Video
                                    </a>
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

                        <motion.button
                            className="hide-button"
                            onClick={() => setExpanded(false)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            HIDE
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default LaunchCard;