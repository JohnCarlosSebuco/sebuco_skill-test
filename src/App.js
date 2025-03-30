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
  const [isFetchingMore, setIsFetchingMore] = useState(false);
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

  const loadMoreLaunches = useCallback(async (onComplete) => {
    if (!hasMore || isFetchingMore) return;
    
    setIsFetchingMore(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newOffset = offset + limit;
    const filtered = searchTerm 
      ? allLaunches.filter(launch =>
          launch.mission_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allLaunches;
    
    const nextBatch = filtered.slice(offset, newOffset);
    setVisibleLaunches(prev => [...prev, ...nextBatch]);
    setOffset(newOffset);
    setHasMore(newOffset < filtered.length);
    
    setIsFetchingMore(false);
    onComplete && onComplete();
  }, [offset, limit, hasMore, allLaunches, searchTerm, isFetchingMore]);

  useInfiniteScroll(loadMoreLaunches, scrollContainerRef, isFetchingMore);

  useEffect(() => {
    if (!allLaunches.length) return;

    const filtered = searchTerm 
      ? allLaunches.filter(launch =>
          launch.mission_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allLaunches;
    
    setVisibleLaunches(filtered.slice(0, limit));
    setOffset(limit);
    setHasMore(filtered.length > limit);
  }, [searchTerm, allLaunches, limit]);

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
        <div 
          className="launches-container" 
          ref={scrollContainerRef}
          style={{ overflowY: 'auto', height: 'calc(80vh - 150px)' }}
        >
          {visibleLaunches.map((launch) => (
            <LaunchCard key={launch.flight_number} launch={launch} />
          ))}
          
          {(isFetchingMore && hasMore) && (
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
    </div>
  );
};

export default App;