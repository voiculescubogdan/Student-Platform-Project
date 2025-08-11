import React, { useState, useEffect, useCallback, useMemo } from "react"
import Post from "./Post/Post.jsx"
import Sort from "../Sort/Sort.jsx"
import Filter from "../Filter/Filter.jsx"
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.jsx"
import useInfiniteScroll from "../../hooks/useInfiniteScroll.js"

export default function PostsList({
  initialFilters = {},
  fetchPostsFunction,
  emptyMessageText = "Nu există postări.",
  showOnlyFollowedOrgs = false,
  pageTitle,
  pageSize = 10
}) {
  const [emptyMessage, setEmptyMessage] = useState(emptyMessageText)
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest")

  const baseInitialFilters = useMemo(() => {
    const filters = { ...initialFilters };
    
    filters.sort = 'DESC';
    
    return filters;
  }, [initialFilters]);

  const enhancedFetchFunction = useCallback(async (params) => {
    const filterParams = {
      ...initialFilters,
      ...params
    };

    if (selectedOrganizations.length > 0) {
      filterParams.org_ids = selectedOrganizations;
    }

    const result = await fetchPostsFunction(filterParams);
    
    setEmptyMessage(result.message || emptyMessageText);
    return result;
  }, [fetchPostsFunction, initialFilters, selectedOrganizations, emptyMessageText]);

  const {
    posts,
    loading,
    loadingMore,
    error,
    hasNextPage,
    currentPage,
    totalCount,
    updateFilters,
    sentinelRef
  } = useInfiniteScroll(enhancedFetchFunction, baseInitialFilters, pageSize);

  useEffect(() => {
    const newFilters = { ...initialFilters };
    if (selectedOrganizations.length > 0) {
      newFilters.org_ids = selectedOrganizations;
    }
    
    if (sortOrder === 'oldest') {
      newFilters.sort = 'ASC';
    } else {
      newFilters.sort = 'DESC';
    }
    
    updateFilters(newFilters);
  }, [selectedOrganizations, sortOrder]);

  const handleSortChange = (newOrder) => {
    setSortOrder(newOrder);
  };

  return (
    <section className="posts-list">
      {loading ? (
        <LoadingSpinner message="Se încarcă postările..." />
      ) : (
        <>
          <h1 className="mb-4 mt-4">{pageTitle}</h1>

          <div className="posts-controls d-flex justify-content-center mb-3 gap-3">
            <Sort
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
            <Filter 
              selectedOrganizations={selectedOrganizations}
              onFilterChange={(orgIds) => setSelectedOrganizations(orgIds)}
              showOnlyFollowed={showOnlyFollowedOrgs}
            />
          </div>

          {error && <div className="error">{error}</div>}
          
          {posts.length === 0 && !loading && (
            <div className="text-center py-4">
              <p>{emptyMessage}</p>
            </div>
          )}
          
          {posts.map(p => (
            <Post key={p.post_id} post={p} />
          ))}

          {hasNextPage && (
            <div ref={sentinelRef} className="infinite-scroll-sentinel" style={{ height: '1px', margin: '10px 0', background: 'transparent' }}>
            </div>
          )}

          {loadingMore && (
            <div className="text-center py-3">
              <LoadingSpinner message="Se încarcă mai multe postări..." />
            </div>
          )}

          {posts.length > 0 && totalCount > 0 && (
            <div className="text-center text-muted mb-3">
              <small>
                Afișate {posts.length} din {totalCount} postări
                {!hasNextPage && posts.length >= pageSize && (
                  <span> • Toate postările au fost încărcate</span>
                )}
              </small>
            </div>
          )}
        </>
      )}
    </section>
  )
}