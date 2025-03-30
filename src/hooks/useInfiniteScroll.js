import { useEffect } from 'react';

const useInfiniteScroll = (callback, scrollRef, isLoading) => {
  useEffect(() => {
    let debounceTimer;
    let isFetching = false;
    
    const handleScroll = () => {
      if (isLoading || isFetching) return;
      
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const container = scrollRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;

        if (isNearBottom) {
          isFetching = true;
          callback(() => {
            isFetching = false;
          });
        }
      }, 100);
    };

    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(debounceTimer);
    };
  }, [callback, isLoading, scrollRef]);
};

export default useInfiniteScroll;