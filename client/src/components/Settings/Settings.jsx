import React, { useState, useContext } from 'react';
import { AuthContext } from '../../state/contexts/AuthContext';
import UserStore from '../../state/stores/UserStore';
import Feed from '../Feed/Feed';
import './Settings.css';
import { FaEdit, FaSave, FaTimes, FaUser, FaLock } from 'react-icons/fa';

export default function Settings() {
  const { user, updateUsername } = useContext(AuthContext);
  
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [usernameLoading, setUsernameLoading] = useState(false);
  
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleUsernameEdit = () => {
    if (isEditingUsername) {
      setUsername(user?.username || '');
      setUsernameError('');
      setUsernameSuccess('');
    }
    setIsEditingUsername(!isEditingUsername);
  };

  const handleUsernameSave = async () => {
    if (!username.trim()) {
      setUsernameError('Numele de utilizator nu poate fi gol');
      return;
    }

    if (username === user?.username) {
      setIsEditingUsername(false);
      return;
    }

    setUsernameLoading(true);
    setUsernameError('');
    setUsernameSuccess('');

    try {
      await UserStore.editCurrentUser({ username });
      
      updateUsername(username);
      
      setUsernameSuccess('Numele de utilizator a fost actualizat cu succes!');
      setIsEditingUsername(false);
      
      setTimeout(() => setUsernameSuccess(''), 3000);
    } catch (err) {
      setUsernameError(err.message || 'Eroare la actualizarea numelui de utilizator');
    } finally {
      setUsernameLoading(false);
    }
  };

  const handlePasswordEdit = () => {
    if (isEditingPassword) {
      setOldPassword('');
      setNewPassword('');
      setPasswordError('');
      setPasswordSuccess('');
    }
    setIsEditingPassword(!isEditingPassword);
  };

  const handlePasswordSave = async () => {
    if (!oldPassword || !newPassword) {
      setPasswordError('Ambele câmpuri pentru parolă sunt obligatorii');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Parola nouă trebuie să aibă cel puțin 6 caractere');
      return;
    }

    if (oldPassword === newPassword) {
      setPasswordError('Parola nouă trebuie să fie diferită de cea veche');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      await UserStore.changePassword({ oldPassword, newPassword });
      setPasswordSuccess('Parola a fost actualizată cu succes!');
      setIsEditingPassword(false);
      setOldPassword('');
      setNewPassword('');
      
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Eroare la actualizarea parolei');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Feed>
      <div className="settings-container">
        <div className="settings-card">
          <div className="settings-header">
            <h1>Setări Cont</h1>
            <p>Gestionează informațiile contului tău</p>
          </div>

          <div className="settings-content">
            <div className="setting-item">
              <div className="setting-label">
                <FaUser className="setting-icon" />
                <span>Nume utilizator</span>
              </div>
              
              <div className="setting-input-group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isEditingUsername}
                  className={`setting-input ${!isEditingUsername ? 'disabled' : ''}`}
                  placeholder="Numele de utilizator"
                />
                
                <div className="setting-buttons">
                  {!isEditingUsername ? (
                    <button 
                      className="btn btn-edit"
                      onClick={handleUsernameEdit}
                      disabled={usernameLoading}
                    >
                      <FaEdit /> Editează
                    </button>
                  ) : (
                    <>
                      <button 
                        className="btn btn-save"
                        onClick={handleUsernameSave}
                        disabled={usernameLoading}
                      >
                        <FaSave /> {usernameLoading ? 'Se salvează...' : 'Salvează'}
                      </button>
                      <button 
                        className="btn btn-cancel"
                        onClick={handleUsernameEdit}
                        disabled={usernameLoading}
                      >
                        <FaTimes /> Anulează
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {usernameError && <div className="error-message">{usernameError}</div>}
              {usernameSuccess && <div className="success-message">{usernameSuccess}</div>}
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <FaLock className="setting-icon" />
                <span>Parolă</span>
              </div>
              
              <div className="setting-input-group">
                {!isEditingPassword ? (
                  <input
                    type="password"
                    value="••••••••"
                    disabled
                    className="setting-input disabled"
                    placeholder="Parola curentă"
                  />
                ) : (
                  <div className="password-inputs">
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="setting-input"
                      placeholder="Parola curentă"
                    />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="setting-input"
                      placeholder="Parola nouă"
                    />
                  </div>
                )}
                
                <div className="setting-buttons">
                  {!isEditingPassword ? (
                    <button 
                      className="btn btn-edit"
                      onClick={handlePasswordEdit}
                      disabled={passwordLoading}
                    >
                      <FaEdit /> Editează
                    </button>
                  ) : (
                    <>
                      <button 
                        className="btn btn-save"
                        onClick={handlePasswordSave}
                        disabled={passwordLoading}
                      >
                        <FaSave /> {passwordLoading ? 'Se salvează...' : 'Salvează'}
                      </button>
                      <button 
                        className="btn btn-cancel"
                        onClick={handlePasswordEdit}
                        disabled={passwordLoading}
                      >
                        <FaTimes /> Anulează
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {passwordError && <div className="error-message">{passwordError}</div>}
              {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
            </div>
          </div>
        </div>
      </div>
    </Feed>
  );
}
