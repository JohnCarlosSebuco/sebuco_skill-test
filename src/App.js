import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useInfiniteScroll from './hooks/useInfiniteScroll';
import LaunchCard from './components/LaunchCard';
import Loading from './components/Loading';
import NoMoreResults from './components/NoMoreResults';
import './App.css';

const API_URL = 'https://api.spacexdata.com/v3/launches';

const App = () => {
  const [visibleLaunches, setVisibleLaunches] = useState([]);
  const [allLaunches, setAllLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [filters, setFilters] = useState({
    launchYear: '',
    launchSuccess: null,
    upcoming: false,
  });
  const limit = 10;
  const scrollContainerRef = useRef(null);

  const fetchAllLaunches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}`);
      const data = await response.json();
      setAllLaunches(data);
      setVisibleLaunches(data.slice(0, limit));
      setOffset(limit);
      setHasMore(data.length > limit);
    } catch (error) {
      console.error('Error fetching launches:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const applyFilters = useCallback(
    (launches) => {
      return launches.filter((launch) => {
        const matchesSearch =
          searchTerm === '' ||
          launch.mission_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesYear =
          filters.launchYear === '' ||
          new Date(launch.launch_date_utc).getFullYear().toString() ===
            filters.launchYear;

        const matchesSuccess =
          filters.launchSuccess === null ||
          (launch.launch_success === filters.launchSuccess && !launch.upcoming);

        const matchesUpcoming = !filters.upcoming || launch.upcoming;

        return matchesSearch && matchesYear && matchesSuccess && matchesUpcoming;
      });
    },
    [searchTerm, filters.launchYear, filters.launchSuccess, filters.upcoming]
  );

  const loadMoreLaunches = useCallback(
    async (onComplete) => {
      if (!hasMore || isFetchingMore) return;

      setIsFetchingMore(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newOffset = offset + limit;
      const filtered = applyFilters(allLaunches);

      const nextBatch = filtered.slice(offset, newOffset);
      setVisibleLaunches((prev) => [...prev, ...nextBatch]);
      setOffset(newOffset);
      setHasMore(newOffset < filtered.length);

      setIsFetchingMore(false);
      onComplete && onComplete();
    },
    [offset, limit, hasMore, allLaunches, isFetchingMore, applyFilters]
  );

  useInfiniteScroll(loadMoreLaunches, scrollContainerRef, isFetchingMore);

  useEffect(() => {
    if (!allLaunches.length) return;

    const filtered = applyFilters(allLaunches);

    setVisibleLaunches(filtered.slice(0, limit));
    setOffset(limit);
    setHasMore(filtered.length > limit);
  }, [searchTerm, filters, allLaunches, limit, applyFilters]);

  useEffect(() => {
    fetchAllLaunches();
  }, [fetchAllLaunches]);

  return (
    <motion.div 
      className="app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="header"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          SpaceX Launches
        </motion.h1>
        
        <motion.div 
          className="filters-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div 
            className="search-wrapper"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="text"
              className="search-input"
              placeholder="Search by mission name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>

          <motion.select
            value={filters.launchYear}
            onChange={(e) => setFilters({ ...filters, launchYear: e.target.value })}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <option value="">All Years</option>
            {Array.from(
              new Set(
                allLaunches.map((l) =>
                  new Date(l.launch_date_utc).getFullYear()
                )
              )
            )
              .sort((a, b) => b - a)
              .map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
          </motion.select>

          <motion.select
            value={
              filters.launchSuccess === null
                ? ''
                : filters.launchSuccess
                ? 'success'
                : 'failed'
            }
            onChange={(e) =>
              setFilters({
                ...filters,
                launchSuccess:
                  e.target.value === ''
                    ? null
                    : e.target.value === 'success',
              })
            }
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </motion.select>
        </motion.div>
      </motion.div>

      {loading && offset === 0 ? (
        <Loading fullPage />
      ) : (
        <div
          className="launches-container"
          ref={scrollContainerRef}
          style={{ overflowY: 'auto', height: 'calc(80vh - 150px)' }}
        >
          <AnimatePresence>
            {visibleLaunches.map((launch) => (
              <motion.div
                key={launch.flight_number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <LaunchCard launch={launch} />
              </motion.div>
            ))}
          </AnimatePresence>

          {isFetchingMore && hasMore && (
            <div className="loading-more-container">
              <Loading />
            </div>
          )}

          {!hasMore && visibleLaunches.length > 0 && <NoMoreResults />}
          {!loading && visibleLaunches.length === 0 && (
            <div className="no-more-container">
              <p className="no-more-text">No launches found</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default App;