import axios from "../../utils/setupAxios.js"
import { SERVER } from '../../config/global.js'

class UserStore {
  data = {}

  async register({ username, email, password }) {
    try {
      const { data } = await axios.post('/auth/register', { username, email, password })
      return data
    } catch (err) {
      throw err.response?.data || err
    }
  }

  async login({ email, password }) {
    try {
      const { data } = await axios.post('/auth/login', { email, password })
      this.data = data

      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

      return data
    } catch (err) {
      throw err.response?.data || err
    }
  }

  async logout() {
    try {
      await axios.post('/auth/logout')

      delete axios.defaults.headers.common['Authorization']
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      this.data = {}
    }
  }

  async requestPasswordReset({ email }) {
    try {
      const { data } = await axios.post('/auth/request-password-reset', { email })
      return data
    } catch (err) {
      throw err.response?.data || err
    }
  }

  async resetPassword({ token, newPassword, newPasswordCheck }) {
    try {
      const { data } = await axios.post(`/auth/reset-password/${token}`, { newPassword, newPasswordCheck })
      return data
    } catch (err) {
      throw err.response?.data || err
    }
  }

  async getUser(userId) {
    try {
      const token = localStorage.getItem('token');
      
      const { data } = await axios.get(`/api/users/get-user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return data;
    } catch (err) {
      console.error('UserStore.getUser - Error:', err);
      throw err.response?.data || err;
    }
  }

  async getUserPosts(userId, params = {}) {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`/api/users/get-user/${userId}/posts`, { 
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return data
    } catch (err) {
      throw err.response?.data || err
    }
  }

  async editCurrentUser({ username }) {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.patch('/api/users/edit-current-user', 
        { username }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return data;
    } catch (err) {
      throw err.response?.data || err;
    }
  }

  async changePassword({ oldPassword, newPassword }) {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.patch('/api/users/change-password', 
        { oldPassword, newPassword }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return data;
    } catch (err) {
      throw err.response?.data || err;
    }
  }

  getToken() {
    return this.data.token
  }

  getCurrentUser() {
    return this.data.user
  }
}

export default new UserStore()