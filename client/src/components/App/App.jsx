import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'

import Start from '../Start/Start.jsx'
import LoginForm from '../LoginForm/LoginForm.jsx'
import RegisterForm from "../RegisterForm/RegisterForm.jsx"
import ConfirmedPage from '../ConfirmedPage/ConfirmedPage.jsx'
import ForgotPasswordForm from '../ForgotPasswordForm/ForgotPasswordForm.jsx'
import ResetPasswordForm from '../ResetPasswordForm/ResetPasswordForm.jsx'
import { ProtectedRoute } from '../ProtectedRoute/ProtectedRoute.jsx'
import { PublicRoute } from '../PublicRoute/PublicRoute.jsx'
import Home from '../Home/Home.jsx'
import AllPosts from '../AllPosts/AllPosts.jsx'
import SelectedPost from '../SelectedPost/SelectedPost.jsx'
import NotificationsPage from '../NotificationsPage/NotificationsPage.jsx'
import CreatePost from '../CreatePost/CreatePost.jsx'
import EditPost from '../EditPost/EditPost.jsx'
import OrganizationsList from '../OrganizationsList/OrganizationsList.jsx'
import SelectedOrganization from '../SelectedOrganization/SelectedOrganization.jsx'
import UserProfile from '../UserProfile/UserProfile.jsx'
import Settings from '../Settings/Settings.jsx'

function App() {
  return (
      <Routes>

        <Route path="/" element={
          <PublicRoute>
            <Start />
          </PublicRoute>
        } />
        
        <Route path="/login" element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <RegisterForm />
          </PublicRoute>
        } />
        
        <Route path="/confirm-email/:token" element={
          <PublicRoute>
            <ConfirmedPage type="email" />
          </PublicRoute>
        } />
        
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPasswordForm />
          </PublicRoute>
        } />
        
        <Route path="/reset-password/:token" element={
          <PublicRoute>
            <ResetPasswordForm />
          </PublicRoute>
        } />
        
        <Route path="/reset-password/success" element={
          <PublicRoute>
            <ConfirmedPage type="password" />
          </PublicRoute>
        } />

        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
          }
        />

        <Route path="/all" element={
          <ProtectedRoute>
            <AllPosts />
          </ProtectedRoute>
          }
        />

        <Route path="post/:id" element={
          <ProtectedRoute>
            <SelectedPost />
          </ProtectedRoute>
        }
        />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
        />

        <Route path="/create-post" element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        }
        />

        <Route path="/edit-post/:postId" element={
          <ProtectedRoute>
            <EditPost />
          </ProtectedRoute>
        }
        />

        <Route path="/organizations" element={
          <ProtectedRoute>
            <OrganizationsList />
          </ProtectedRoute>
        }
        />

        <Route path="/organization/:oid" element={
          <ProtectedRoute>
            <SelectedOrganization />
          </ProtectedRoute>
        }
        />

        <Route path="/user/:userId" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
        />

        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
        />

        <Route path="*" element={<Navigate to="/home" replace />} />

      </Routes>
  )
}

export default App
