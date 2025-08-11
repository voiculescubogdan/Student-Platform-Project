import React from 'react'
import { Link } from 'react-router-dom'
import { FaUsers, FaComments, FaArrowRight, FaBookOpen, FaTrophy } from 'react-icons/fa'
import './Start.css'

export default function Start() {
  return (
    <div className="start-container">
      <div className="background-layer"></div>
      
      <div className="content-container">
        <div className="hero-section">
          <div className="hero-content">
            <div className="brand-section">
              <h1 className="brand-title">Student Platform</h1>
              <p className="brand-subtitle">Conectează-te, învață, crește împreună</p>
            </div>
            
            <div className="hero-description">
              <p className="description-text">
                Platforma ideală pentru studenți și educatori. Colaborează, împărtășește cunoștințe 
                și construiește comunități de învățare în mediul academic.
              </p>
            </div>

            <div className="action-buttons">
              <Link to="/login" className="btn-primary">
                <span>Intră în cont</span>
                <FaArrowRight className="btn-icon" />
              </Link>
              <Link to="/register" className="btn-secondary">
                <span>Creează cont</span>
              </Link>
            </div>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaComments />
              </div>
              <h3>Discuții Interactive</h3>
              <p>Participă la conversații academice și împărtășește idei cu colegii</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaUsers />
              </div>
              <h3>Comunitate Activă</h3>
              <p>Conectează-te cu studenți și profesori din diverse domenii</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaBookOpen />
              </div>
              <h3>Resurse Educaționale</h3>
              <p>Accesează și distribuie materiale de studiu și resurse utile</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaTrophy />
              </div>
              <h3>Gamificare și Recompense</h3>
              <p>Câștigă puncte și badge-uri pentru participarea activă în comunitate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}