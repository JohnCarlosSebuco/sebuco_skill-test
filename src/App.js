import React, { useState, useEffect, useCallback } from 'react';
import useInfiniteScroll from './hooks/useInfiniteScroll';
import LaunchCard from './components/LaunchCard';
import Loading from './components/Loading';
import NoMoreResults from './components/NoMoreResults';
import './index.css';

const API_URL = 'https://api.spacexdata.com/v3/launches';

const App = () => {
  const [launches, setLaunches] = useState([]);
  const [allLaunches, setAllLaunches] = useState([]); // Store all launches for client-side filtering
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 10;

  // Fetch all launches initially
  const fetchAllLaunches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}`);
      const data = await response.json();
      setAllLaunches(data);
      setLaunches(data.slice(0, limit));
      setOffset(limit);
      setHasMore(data.length > limit);
    } catch (error) {
      console.error('Error fetching launches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more launches for infinite scroll
  const fetchMoreLaunches = useCallback(() => {
    if (!hasMore) return;
    
    const newOffset = offset + limit;
    const newLaunches = allLaunches.slice(offset, newOffset);
    setLaunches(prev => [...prev, ...newLaunches]);
    setOffset(newOffset);
    setHasMore(newOffset < allLaunches.length);
  }, [offset, limit, hasMore, allLaunches]);

  // Initialize infinite scroll with the callback
  const [isFetching] = useInfiniteScroll(fetchMoreLaunches);

  // Filter launches based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setLaunches(allLaunches.slice(0, offset));
      return;
    }

    const filtered = allLaunches.filter(launch =>
      launch.mission_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setLaunches(filtered.slice(0, offset));
    setHasMore(filtered.length > offset);
  }, [searchTerm, allLaunches, offset]);

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

      {loading ? (
        <Loading />
      ) : (
        <div className="launches-container">
          {launches.map((launch) => (
            <LaunchCard key={launch.flight_number} launch={launch} />
          ))}
          {isFetching && hasMore && <Loading />}
          {!hasMore && launches.length > 0 && <NoMoreResults />}
          {!loading && launches.length === 0 && (
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