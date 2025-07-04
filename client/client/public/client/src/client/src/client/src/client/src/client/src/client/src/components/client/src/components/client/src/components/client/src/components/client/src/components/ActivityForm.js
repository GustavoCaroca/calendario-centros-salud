import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, X, AlertCircle } from 'lucide-react';

const ActivityForm = ({ centros, selectedDate, activity, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    centro_id: '',
    titulo: '',
    descripcion: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    estado: 'programada'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activity) {
      // Modo edición
      setFormData({
        centro_id: activity.centro_id,
        titulo: activity.titulo,
        descripcion: activity.descripcion || '',
        fecha: activity.fecha,
        hora_inicio: activity.hora_inicio,
        hora_fin: activity.hora_fin,
        estado: activity.estado
      });
    } else if (selectedDate) {
      // Modo creación
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        fecha: dateString
      }));
    }
  }, [activity, selectedDate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.centro_id) {
      setError('Debe seleccionar un centro de salud');
      return false;
    }
    if (!formData.titulo.trim()) {
      setError('El título es requerido');
      return false;
    }
    if (!formData.fecha) {
      setError('La fecha es requerida');
      return false;
    }
    if (!formData.hora_inicio) {
      setError('La hora de inicio es requerida');
      return false;
    }
    if (!formData.hora_fin) {
      setError('La hora de fin es requerida');
      return false;
    }
    if (formData.hora_inicio >= formData.hora_fin) {
      setError('La hora de fin debe ser posterior a la hora de inicio');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (activity) {
        // Actualizar actividad existente
        await axios.put(`/api/actividades/${activity.id}`, formData, { headers });
      } else {
        // Crear nueva actividad
        await axios.post('/api/actividades', formData, { headers });
      }

      onSubmit();
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Error al guardar la actividad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="activity-form">
      <div className="form-header">
        <h2>{activity ? 'Editar Actividad' : 'Nueva Actividad'}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="centro_id">Centro de Salud *</label>
          <select
            id="centro_id"
            name="centro_id"
            value={formData.centro_id}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Seleccionar centro</option>
            {centros.map(centro => (
              <option key={centro.id} value={centro.id}>
                {centro.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="titulo">Título *</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ej: Consulta médica, Vacunación, etc."
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Descripción opcional de la actividad"
            rows="3"
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha">Fecha *</label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="programada">Programada</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="hora_inicio">Hora de Inicio *</label>
            <input
              type="time"
              id="hora_inicio"
              name="hora_inicio"
              value={formData.hora_inicio}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="hora_fin">Hora de Fin *</label>
            <input
              type="time"
              id="hora_fin"
              name="hora_fin"
              value={formData.hora_fin}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={onClose}
            disabled={loading}
          >
            <X size={16} />
            Cancelar
          </button>
          <button 
            type="submit" 
            className="save-button"
            disabled={loading}
          >
            <Save size={16} />
            {loading ? 'Guardando...' : (activity ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityForm;
