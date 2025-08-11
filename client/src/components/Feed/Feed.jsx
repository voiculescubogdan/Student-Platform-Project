import React from 'react'

function Feed({ children }) {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Feed