import axios from "../../utils/setupAxios.js"
import {SERVER} from "../../config/global.js"

class PostStore {
  async getFollowedPosts(params = {}) {
    try {
      const res = await axios.get("/api/users/posts/get-posts/followed", { params })
      return {
        message: res.data.message,
        posts: res.data.posts,
        pagination: res.data.pagination
      }
    } catch (err) {
      throw err.response?.data || err
    }
  }

  async getAllPosts(params = {}) {
    try {
      const res = await axios.get("/api/users/posts/get-posts", {params})
      return {
        message: res.data.message,
        posts: res.data.posts,
        pagination: res.data.pagination
      }
    } catch (err) {
      throw err.response?.data || err
    }
  }

  async getOrganizationPosts(organizationId, params = {}) {
  try {
    const res = await axios.get(`/api/users/get-organization/${organizationId}/posts`, { params });
    return {
      message: res.data.message,
      posts: res.data.posts,
      organization: res.data.organization,
      isFollowing: res.data.isFollowing,
      pagination: res.data.pagination
    };
  } catch (err) {
    throw err.response?.data || err;
  }
}

  async getPost(postId) {
    try {
      const res = await axios.get(`/api/users/posts/get-post/${postId}`)
      return {
        message: res.data.message,
        post: res.data.post,
        isAssigned: res.data.isAssigned,
      }
    } catch (err) {
      throw err.response?.data || err
    }
  }

  async reportPost(postId) {
    try {
      const response = await axios.post(`${SERVER}/api/users/posts/get-post/${postId}/report`);
      return response.data;
    } catch (error) {
      console.error("Eroare la raportarea postării:", error);
      throw error;
    }
  }

  async editPost(postId, formData) {
    try {
      const response = await axios.patch(`/api/users/posts/edit-post/${postId}`, formData);
      return response.data;
    } catch (error) {
      console.error("Eroare la editarea postării:", error);
      throw error;
    }
  }

  async deletePost(postId) {
    try {
      const response = await axios.delete(`/api/users/posts/delete-post/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Eroare la ștergerea postării:", error);
      throw error;
    }
  }

}

export default new PostStore()