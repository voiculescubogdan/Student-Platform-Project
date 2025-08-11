import axios from '../../utils/setupAxios';
import { SERVER } from '../../config/global';
import { makeAutoObservable, runInAction } from 'mobx';

class CommentStore {
  comments = [];
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  async getCommentsByPostId(postId) {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await axios.get(`${SERVER}/api/users/posts/get-post/${postId}/comments`);
      runInAction(() => {
        if (response.data && Array.isArray(response.data.comments)) {
          this.comments = this.buildCommentTree(response.data.comments);
        } else if (Array.isArray(response.data)) {
          this.comments = this.buildCommentTree(response.data);
        } else {
          this.comments = [];
          console.warn('Răspunsul pentru comentarii nu are structura așteptată:', response.data);
        }
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || error.message;
        this.loading = false;
        this.comments = [];
      });
      console.error('Eroare la încărcarea comentariilor:', error);
    }
  }

  async addComment(postId, commentText, replyId = null) {
    this.loading = true;
    this.error = null;
    
    try {
      const url = `${SERVER}/api/users/posts/get-post/${postId}/create-comment/${replyId || 'null'}`;
      
      const response = await axios.post(url, { commentText });
      
      runInAction(() => {
        this.getCommentsByPostId(postId);
      });
      
      return response.data;
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      console.error('Eroare la adăugarea comentariului:', error);
      return null;
    }
  }

  async editComment(commentId, postId, newCommentText) {
    try {
      await axios.patch(`${SERVER}/api/users/posts/get-post/${postId}/get-comment/${commentId}/edit`, {
        newCommentText
      });
      
      runInAction(() => {
        this.getCommentsByPostId(postId);
      });
    } catch (error) {
      console.error('Eroare la editarea comentariului:', error);
      throw error;
    }
  }

  async deleteComment(commentId, postId) {
    try {
      await axios.delete(`${SERVER}/api/users/posts/get-post/${postId}/get-comment/${commentId}/delete`);
      
      runInAction(() => {
        this.getCommentsByPostId(postId);
      });
    } catch (error) {
      console.error('Eroare la ștergerea comentariului:', error);
    }
  }

  async reportComment(commentId, postId) {
    try {
      const response = await axios.post(`${SERVER}/api/users/posts/get-post/${postId}/report-comment/${commentId}`, { postId });
      return response.data;
    } catch (error) {
      console.error("Eroare la raportarea comentariului:", error);
      throw error;
    }
  }

  buildCommentTree(comments) {
    if (!Array.isArray(comments) || comments.length === 0) {
      return [];
    }

    const commentMap = {};
    comments.forEach(comment => {
      commentMap[comment.comment_id] = {
        ...comment,
        children: []
      };
    });

    const rootComments = [];
    comments.forEach(comment => {
      if (comment.reply_id) {
        if (commentMap[comment.reply_id]) {
          commentMap[comment.reply_id].children.push(commentMap[comment.comment_id]);
        } else {
          rootComments.push(commentMap[comment.comment_id]);
        }
      } else {
        rootComments.push(commentMap[comment.comment_id]);
      }
    });

    return rootComments;
  }
}

export default new CommentStore();