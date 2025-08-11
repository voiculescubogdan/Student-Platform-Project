import { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import userStore from '../stores/UserStore.js'
import axios from "../../utils/setupAxios.js"
import { resetLikedPostsStore, initializePostLikes } from '../../utils/likedPostUtil.js';
import { resetLikedCommentsStore, initializeCommentLikes } from '../../utils/likedCommentUtil.js';
import { resetNotificationsStore } from '../../utils/notificationUtil.js';
import { setUpdateNotificationsCount } from '../stores/NotificationStore.js';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isAuthorized: () => false,
  login: async () => {},
  logout: () => {},
  updateNotificationsCount: () => {},
  updateUsername: () => {}
});

function AuthProvider({ children }) {

  const initializeLikes = useCallback(async () => {
    try {
      await initializePostLikes();
      await initializeCommentLikes();
    } catch (error) {
      console.error('Eroare la inițializarea like-urilor:', error);
    }
  }, []);

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null')
    if(token && savedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      userStore.data = savedUser
      
      setTimeout(() => {
        initializeLikes();
      }, 0);
      
      return savedUser
    }
    return null
  });

  const login = useCallback(async credentials => {
    const data = await userStore.login(credentials)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setUser(data.user)
    
    await initializeLikes();
    return data
  }, [initializeLikes])

  const logout = useCallback(async () => {
    await userStore.logout()
    delete axios.defaults.headers.common['Authorization']
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    
    resetLikedPostsStore();
    resetLikedCommentsStore();
    resetNotificationsStore();
  }, [])

  const isAuthenticated = Boolean(user);

  const isAuthorized = useCallback(requiredTypes => {
    if (!user) return false
    return requiredTypes.some(type => user.user_type.includes(type))
  }, [user])

  const updateNotificationsCount = useCallback((newCount) => {
    if (user) {
      const updatedUser = { ...user, notifications_count: newCount };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [user]);

  const updateUsername = useCallback((newUsername) => {
    if (user) {
      const updatedUser = { ...user, username: newUsername };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [user]);

  useEffect(() => {
    setUpdateNotificationsCount(updateNotificationsCount);
  }, [updateNotificationsCount]);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isAuthorized,
    login,
    logout,
    updateNotificationsCount,
    updateUsername
  }), [user, isAuthenticated, isAuthorized, login, logout, updateNotificationsCount, updateUsername])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
export default AuthProvider;
