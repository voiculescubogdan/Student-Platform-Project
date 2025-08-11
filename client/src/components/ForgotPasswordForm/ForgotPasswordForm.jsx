import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UserStore from '../../state/stores/UserStore.js'
import './ForgotPasswordForm.css'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    try {
      const data = await UserStore.requestPasswordReset({ email })
      setMessage(data.message || 'Verifică-ți email-ul pentru instrucțiuni.')
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Eroare la trimiterea email-ului')
    }
  }

  if (message) {
    return (
      <div className="forgot-success">
        <h1>{message}</h1>
        <button onClick={() => navigate('/login')}>Înapoi la Login</button>
      </div>
    )
  }

  return (
    <div className="forgot-form">
      <form onSubmit={handleSubmit}>
        <h2>Resetare Parolă</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">Trimite</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  )
}