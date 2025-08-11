import React from 'react'
import Feed from '../Feed/Feed'
import PostsList from '../PostsList/PostsList'
import PostStore from '../../state/stores/PostStore'

function Home() {
  return (
    <Feed>
      <PostsList
        initialFilters={{ status: "active" }}
        fetchPostsFunction={PostStore.getFollowedPosts.bind(PostStore)}
        emptyMessageText='Nu urmărești nicio organizație sau nu există postări!'
        showOnlyFollowedOrgs={true}
        pageTitle="Pagina principală"
        pageSize={5}
      />
    </Feed>
  )
}

export default Home