import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Printer, Save, X, FileText, Clock, MapPin, User, Calendar } from 'lucide-react';

const RouteSheet = ({ activity, onClose }) => {
  const [routeData, setRouteData] = useState({
    responsable: '',
    vehiculo: '',
    kilometraje_inicial: '',
    kilometraje_final: '',
    combustible_inicial: '',
    combustible_final: '',
    observaciones: '',
    materiales: '',
    participantes: ''
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchExistingRoute();
  }, [activity.id]);

  const fetchExistingRoute = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/hojas-ruta/${activity.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.contenido) {
        setRouteData(response.data.contenido);
        setSaved(true);
      }
    } catch (error) {
      // No existe hoja de ruta previa, mantener datos vacíos
      console.log('No hay hoja de ruta previa');
    }
  };

  const handleChange = (e) => {
    setRouteData({
      ...routeData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/hojas-ruta', {
        actividad_id: activity.id,
        contenido: routeData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSaved(true);
      alert('Hoja de ruta guardada correctamente');
    } catch (error) {
      console.error('Error al guardar hoja de ruta:', error);
      alert('Error al guardar la hoja de ruta');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5);
  };

  return (
    <div className="route-sheet">
      <div className="route-header">
        <div className="route-title">
          <FileText size={24} />
          <h2>Hoja de Ruta</h2>
        </div>
        <div className="route-actions">
          <button 
            className="save-route-btn"
            onClick={handleSave}
            disabled={loading}
          >
            <Save size={16} />
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button 
            className="print-route-btn"
            onClick={handlePrint}
          >
            <Printer size={16} />
            Imprimir
          </button>
        </div>
      </div>

      <div className="route-content" id="printable-route">
        <div className="route-info-section">
          <h3>Información de la Actividad</h3>
          <div className="info-grid">
            <div className="info-item">
              <FileText size={16} />
              <span><strong>Actividad:</strong> {activity.titulo}</span>
            </div>
            <div className="info-item">
              <MapPin size={16} />
              <span><strong>Centro:</strong> {activity.centro_nombre}</span>
            </div>
            <div className="info-item">
              <Calendar size={16} />
              <span><strong>Fecha:</strong> {formatDate(activity.fecha)}</span>
            </div>
            <div className="info-item">
              <Clock size={16} />
              <span><strong>Horario:</strong> {formatTime(activity.hora_inicio)} - {formatTime(activity.hora_fin)}</span>
            </div>
            {activity.descripcion && (
              <div className="info-item full-width">
                <span><strong>Descripción:</strong> {activity.descripcion}</span>
              </div>
            )}
          </div>
        </div>

        <div className="route-form-section">
          <h3>Datos de la Hoja de Ruta</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="responsable">
                <User size={16} />
                Responsable
              </label>
              <input
                type="text"
                id="responsable"
                name="responsable"
                value={routeData.responsable}
                onChange={handleChange}
                placeholder="Nombre del responsable"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="vehiculo">Vehículo</label>
              <input
                type="text"
                id="vehiculo"
                name="vehiculo"
                value={routeData.vehiculo}
                onChange={handleChange}
                placeholder="Placa o identificación del vehículo"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="kilometraje_inicial">Kilometraje Inicial</label>
              <input
                type="number"
                id="kilometraje_inicial"
                name="kilometraje_inicial"
                value={routeData.kilometraje_inicial}
                onChange={handleChange}
                placeholder="Km inicial"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="kilometraje_final">Kilometraje Final</label>
              <input
                type="number"
                id="kilometraje_final"
                name="kilometraje_final"
                value={routeData.kilometraje_final}
                onChange={handleChange}
                placeholder="Km final"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="combustible_inicial">Combustible Inicial</label>
              <select
                id="combustible_inicial"
                name="combustible_inicial"
                value={routeData.combustible_inicial}
                onChange={handleChange}
              >
                <option value="">Seleccionar</option>
                <option value="1/4">1/4</option>
                <option value="1/2">1/2</option>
                <option value="3/4">3/4</option>
                <option value="Lleno">Lleno</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="combustible_final">Combustible Final</label>
              <select
                id="combustible_final"
                name="combustible_final"
                value={routeData.combustible_final}
                onChange={handleChange}
              >
                <option value="">Seleccionar</option>
                <option value="1/4">1/4</option>
                <option value="1/2">1/2</option>
                <option value="3/4">3/4</option>
                <option value="Lleno">Lleno</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="participantes">Participantes</label>
            <textarea
              id="participantes"
              name="participantes"
              value={routeData.participantes}
              onChange={handleChange}
              placeholder="Lista de participantes en la actividad"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="materiales">Materiales Utilizados</label>
            <textarea
              id="materiales"
              name="materiales"
              value={routeData.materiales}
              onChange={handleChange}
              placeholder="Lista de materiales y equipos utilizados"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={routeData.observaciones}
              onChange={handleChange}
              placeholder="Observaciones generales de la actividad"
              rows="4"
            />
          </div>
        </div>

        <div className="route-signatures">
          <div className="signature-section">
            <div className="signature-box">
              <div className="signature-line"></div>
              <p>Firma del Responsable</p>
            </div>
            
            <div className="signature-box">
              <div className="signature-line"></div>
              <p>Firma del Supervisor</p>
            </div>
          </div>
          
          <div className="route-footer">
            <p><strong>Fecha de generación:</strong> {new Date().toLocaleDateString('es-ES')}</p>
            {saved && <p className="saved-indicator">✓ Guardado</p>}
          </div>
        </div>
      </div>

      <div className="route-modal-actions">
        <button className="close-route-btn" onClick={onClose}>
          <X size={16} />
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default RouteSheet;
