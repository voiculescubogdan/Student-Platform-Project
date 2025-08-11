import React from 'react'
import Feed from '../Feed/Feed'
import PostsList from '../PostsList/PostsList'
import PostStore from '../../state/stores/PostStore'

function AllPosts() {
  return (
    <Feed>
      <PostsList
        initialFilters={{ status: "active" }}
        fetchPostsFunction={PostStore.getAllPosts.bind(PostStore)}
        emptyMessageText='Nu există postări disponibile!'
        showOnlyFollowedOrgs={false}
        pageTitle="Toate postările"
        pageSize={5}
      />
    </Feed>
  )
}

export default AllPosts