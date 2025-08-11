import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js';
import './LoginForm.css'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login({ email, password })
      navigate("/home", { replace: true })

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-background-layer"></div>
      
      <div className="login-content-container">
        <div className="login-form">
          <div className="login-header">
            <h1>Autentifică-te pe platformă!</h1>
          </div>
          <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <div className="forgot-password">
              <Link to="/forgot-password">Ai uitat parola?</Link>
          </div>
          <div className="button-container">
            {isLoading ? (
              <div className="login-loading">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Se încarcă...</span>
                </div>
                <span className="ms-2">Se autentifică...</span>
              </div>
            ) : (
              <button type="submit" className="btn btn-light" disabled={isLoading}>
                Login
              </button>
            )}
          </div>
          {error && <div className="error">{error}</div>}
        </form>
        </div>
      </div>
    </div>
  )
}
