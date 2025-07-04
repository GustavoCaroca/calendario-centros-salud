import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, 
  Users, 
  Activity, 
  LogOut, 
  Plus, 
  Clock,
  Building2,
  User,
  Settings
} from 'lucide-react';

const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    totalActividades: 0,
    actividadesHoy: 0,
    centrosActivos: 0,
    actividadesPendientes: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Obtener estadísticas
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      const [actividadesResponse, centrosResponse] = await Promise.all([
        axios.get(`/api/actividades?mes=${currentMonth}&año=${currentYear}`, { headers }),
        axios.get('/api/centros', { headers })
      ]);

      const actividades = actividadesResponse.data;
      const centros = centrosResponse.data;

      // Calcular estadísticas
      const todayString = today.toISOString().split('T')[0];
      const actividadesHoy = actividades.filter(act => act.fecha === todayString).length;
      const actividadesPendientes = actividades.filter(act => act.estado === 'programada').length;

      setStats({
        totalActividades: actividades.length,
        actividadesHoy,
        centrosActivos: centros.length,
        actividadesPendientes
      });

      // Obtener actividades recientes
      const recent = actividades
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      setRecentActivities(recent);

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Panel de Control</h1>
          <div className="user-info">
            <User size={20} />
            <span>{user.nombre}</span>
            <button className="logout-button" onClick={onLogout}>
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalActividades}</h3>
              <p>Actividades este mes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.actividadesHoy}</h3>
              <p>Actividades hoy</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Building2 size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.centrosActivos}</h3>
              <p>Centros activos</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.actividadesPendientes}</h3>
              <p>Pendientes</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Acciones Rápidas</h2>
            </div>
            <div className="quick-actions">
              <Link to="/calendar" className="action-card">
                <Calendar size={32} />
                <h3>Ver Calendario</h3>
                <p>Gestionar actividades</p>
              </Link>
              
              <div className="action-card" onClick={() => window.location.href = '/calendar'}>
                <Plus size={32} />
                <h3>Nueva Actividad</h3>
                <p>Programar actividad</p>
              </div>
              
              <div className="action-card">
                <Settings size={32} />
                <h3>Configuración</h3>
                <p>Ajustes del sistema</p>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Actividades Recientes</h2>
            </div>
            <div className="recent-activities">
              {recentActivities.length === 0 ? (
                <p className="no-activities">No hay actividades recientes</p>
              ) : (
                recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-info">
                      <h4>{activity.titulo}</h4>
                      <p>{activity.centro_nombre}</p>
                      <div className="activity-meta">
                        <span>{formatDate(activity.fecha)}</span>
                        <span>{formatTime(activity.hora_inicio)} - {formatTime(activity.hora_fin)}</span>
                        <span className={`status ${activity.estado}`}>
                          {activity.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
