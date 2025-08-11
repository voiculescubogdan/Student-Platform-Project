import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../utils/setupAxios.js'
import UserStore from '../../state/stores/UserStore'
import './RegisterForm.css'

export default function RegisterForm() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const savedEmail = localStorage.getItem('pendingEmail') || ''
  const [resendLoading, setResendLoading] = useState(false)
  const [resendError, setResendError] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (password !== confirm) {
      setError('Parolele nu coincid')
      setIsLoading(false)
      return
    }

    try {
      const data = await UserStore.register({ username, email, password })
      localStorage.setItem('pendingEmail', email)
      setMessage(data.message || 'Înregistrare cu succes')
      setDone(true)
    } catch (err) {
      setError(err.message || err.data?.message || 'Înregistrare eșuată')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setResendError('')
    setResendLoading(true)
    try {
      const { data } = await axios.post('/auth/resend-confirmation', { email: savedEmail })
      setMessage(data.message)
    } catch (err) {
      setResendError(err.response?.data?.message || 'Eroare la trimiterea mail-ului')
    } finally {
      setResendLoading(false)
    }
  }

  if (done) {
    return (
      <div className="register-container">
        <div className="register-background-layer"></div>
        
        <div className="register-content-container">
          <div className="register-success">
            <h1>{message}</h1>
            <div className="actions">
              <button onClick={() => navigate('/login')}>Mergi la Login</button>
              <button
                onClick={handleResend}
                disabled={!savedEmail || resendLoading}
              >
                {resendLoading ? 'Se trimite…' : 'Retrimite email'}
              </button>
            </div>
            {resendError && <div className="error">{resendError}</div>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="register-container">
      <div className="register-background-layer"></div>
      
      <div className="register-content-container">
        <div className="register-form">
          <div className="form-header">
            <h1>Înregistrează-te pe platformă!</h1>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Parolă"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirmă Parola"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
            <div className="button-container">
              {isLoading ? (
                <div className="register-loading">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Se încarcă...</span>
                  </div>
                  <span className="ms-2">Se înregistrează...</span>
                </div>
              ) : (
                <button type="submit" className="btn btn-light" disabled={isLoading}>
                  Register
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