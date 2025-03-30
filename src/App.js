import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const limit = 10;
  const scrollContainerRef = useRef(null);

  // Fetch all launches initially
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

  // Load more launches
  const loadMoreLaunches = useCallback(() => {
    if (!hasMore || loading) return;

    setLoading(true);
    
    setTimeout(() => {
      const newOffset = offset + limit;
      const filtered = searchTerm 
        ? allLaunches.filter(launch =>
            launch.mission_name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : allLaunches;
      
      const newLaunches = filtered.slice(offset, newOffset);
      setVisibleLaunches(prev => [...prev, ...newLaunches]);
      setOffset(newOffset);
      setHasMore(newOffset < filtered.length);
      setLoading(false);
    }, 300);
  }, [offset, limit, hasMore, allLaunches, searchTerm, loading]);

  // Initialize infinite scroll
  useInfiniteScroll(loadMoreLaunches, scrollContainerRef, loading);

  // Handle search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setVisibleLaunches(allLaunches.slice(0, limit));
        setOffset(limit);
        setHasMore(allLaunches.length > limit);
        return;
      }

      const filtered = allLaunches.filter(launch =>
        launch.mission_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setVisibleLaunches(filtered.slice(0, limit));
      setOffset(limit);
      setHasMore(filtered.length > limit);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, allLaunches, limit]);

  // Initial load
  useEffect(() => {
    fetchAllLaunches();
  }, [fetchAllLaunches]);

  return (
    <div className="app">
      <div className="header">
        <h1>SpaceX Launches</h1>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by mission name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading && offset === 0 ? (
        <Loading fullPage />
      ) : (
        <div className="launches-container" ref={scrollContainerRef}>
          {visibleLaunches.map((launch) => (
            <LaunchCard key={launch.flight_number} launch={launch} />
          ))}
          {loading && hasMore && <Loading />}
          {!hasMore && visibleLaunches.length > 0 && <NoMoreResults />}
          {!loading && visibleLaunches.length === 0 && (
            <div className="no-more-container">
              <p className="no-more-text">No launches found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;