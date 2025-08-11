import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import UserStore from '../../state/stores/UserStore.js'
import './ResetPasswordForm.css'

export default function ResetPasswordForm() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordCheck, setNewPasswordCheck] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    
    try {
      const data = await UserStore.resetPassword({ token, newPassword, newPasswordCheck })
      const mesaj = data.message;
      setMessage(data.message || 'Parola a fost resetată cu succes')
      setDone(true)
      navigate(`/reset-password/success`, { 
        replace: true, 
        state: {message: data.message} })
    } catch (err) {
      setError(err.message || err.data?.message || 'Resetare eșuată')
    }
  }

  if (done) {
    return (
      <div className="reset-success">
        <h1>{message}</h1>
        <button onClick={() => navigate('/login')}>Mergi la Login</button>
      </div>
    )
  }

  return (
    <div className="reset-form">
      <form onSubmit={handleSubmit}>
        <h2>Resetare Parolă</h2>
        <input
          type="password"
          placeholder="Parolă Nouă"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirmă Parolă Nouă"
          value={newPasswordCheck}
          onChange={e => setNewPasswordCheck(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  )
}