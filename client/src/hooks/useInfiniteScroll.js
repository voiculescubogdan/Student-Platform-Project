import { useState, useEffect, useCallback, useRef } from 'react';

const useInfiniteScroll = (fetchFunction, initialFilters = {}, pageSize = 5) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(initialFilters);
  const [totalCount, setTotalCount] = useState(0);
  const prevFiltersRef = useRef(initialFilters);
  const isInitialLoad = useRef(true);

  const fetchFirstPage = useCallback(async (newFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...newFilters,
        page: 1,
        limit: pageSize
      };

      const response = await fetchFunction(params);
      
      setPosts(response.posts || []);
      setCurrentPage(1);
      setHasNextPage(response.pagination?.hasNextPage || false);
      setTotalCount(response.totalCount || response.totalPostsCount || response.pagination?.totalCount || 0);
      
      return response;
    } catch (err) {
      setError(err.message || 'Eroare la încărcarea postărilor');
      setPosts([]);
      setHasNextPage(false);
      setTotalCount(0);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, pageSize]);

  const fetchNextPage = useCallback(async () => {
    if (loadingMore || !hasNextPage) return;

    try {
      setLoadingMore(true);
      setError(null);
      
      const nextPage = currentPage + 1;
      const params = {
        ...filters,
        page: nextPage,
        limit: pageSize
      };

      const response = await fetchFunction(params);
      
      setPosts(prevPosts => [...prevPosts, ...(response.posts || [])]);
      setCurrentPage(nextPage);
      setHasNextPage(response.pagination?.hasNextPage || false);
      setTotalCount(response.totalCount || response.totalPostsCount || response.pagination?.totalCount || 0);
      
      return response;
    } catch (err) {
      setError(err.message || 'Eroare la încărcarea postărilor suplimentare');
      throw err;
    } finally {
      setLoadingMore(false);
    }
  }, [fetchFunction, pageSize, filters, currentPage, hasNextPage, loadingMore]);

  const updateFilters = useCallback(async (newFilters) => {
    const newFiltersString = JSON.stringify(newFilters);
    const currentFiltersString = JSON.stringify(filters);
    
    if (newFiltersString !== currentFiltersString) {
      setFilters(newFilters);
      await fetchFirstPage(newFilters);
    }
  }, [fetchFirstPage, filters]);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      fetchFirstPage(initialFilters);
    }
  }, []);

  useEffect(() => {
    if (!isInitialLoad.current) {
      const filtersChanged = JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);
      
      if (filtersChanged) {
        prevFiltersRef.current = filters;
        fetchFirstPage(filters);
      }
    }
  }, [filters, fetchFirstPage]);

  const [isFetching, setIsFetching] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !loadingMore && !loading && !isFetching) {
          setIsFetching(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (sentinelRef.current && hasNextPage) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, loadingMore, loading, isFetching]);

  useEffect(() => {
    if (isFetching && hasNextPage && !loadingMore) {
      fetchNextPage().finally(() => {
        setIsFetching(false);
      });
    }
  }, [isFetching, fetchNextPage, hasNextPage, loadingMore]);

  return {
    posts,
    loading,
    loadingMore,
    error,
    hasNextPage,
    currentPage,
    totalCount,
    filters,
    fetchFirstPage,
    fetchNextPage,
    updateFilters,
    sentinelRef
  };
};

export default useInfiniteScroll;
