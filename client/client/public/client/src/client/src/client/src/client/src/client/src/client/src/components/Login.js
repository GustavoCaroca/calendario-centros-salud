import React, { useState } from 'react';
import axios from 'axios';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', credentials);
      onLogin(response.data.token, response.data.user);
    } catch (error) {
      setError(error.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <LogIn className="login-icon" size={48} />
          <h1>Sistema de Calendarización</h1>
          <p>Centros de Salud</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <User className="form-icon" size={20} />
            <input
              type="text"
              name="username"
              placeholder="Usuario"
              value={credentials.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <Lock className="form-icon" size={20} />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p>Credenciales por defecto:</p>
          <p><strong>Usuario:</strong> admin</p>
          <p><strong>Contraseña:</strong> admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
