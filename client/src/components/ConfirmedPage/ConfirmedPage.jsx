import React, { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import axios from "../../utils/setupAxios.js"
import './ConfirmedPage.css'

export default function ConfirmedPage({ type }) {
  const { token } = useParams()
  const { state } = useLocation()
  const [message, setMessage] = useState('Se procesează…')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (type === 'email') {
      axios.get(`/auth/confirm-email/${token}`)
        .then(res => setMessage(res.data.message))
        .catch(e => setError(e.response?.data?.message || 'Eroare de server'))
    } else {
      setMessage(state?.message || 'Parola resetata!')
    }

  }, [token, type, state])

  return (
    <div className="confirmed-page">
      <h1>{ error || message }</h1>
    </div>
  )
}