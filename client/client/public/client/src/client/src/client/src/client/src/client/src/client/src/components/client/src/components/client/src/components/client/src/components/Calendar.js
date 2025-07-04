import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  User,
  Home,
  Filter,
  Printer,
  Save,
  X,
  Clock,
  MapPin
} from 'lucide-react';
import Modal from './Modal';
import ActivityForm from './ActivityForm';
import RouteSheet from './RouteSheet';

const Calendar = ({ user, socket, onLogout }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [centros, setCentros] = useState([]);
  const [selectedCentro, setSelectedCentro] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'edit', 'route'
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    fetchCentros();
    fetchActivities();
  }, [currentDate, selectedCentro]);

  useEffect(() => {
    if (socket) {
      socket.on('nueva_actividad', handleNewActivity);
      socket.on('actividad_actualizada', handleActivityUpdate);
      socket.on('actividad_eliminada', handleActivityDelete);

      return () => {
        socket.off('nueva_actividad');
        socket.off('actividad_actualizada');
        socket.off('actividad_eliminada');
      };
    }
  }, [socket]);

  const fetchCentros = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/centros', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCentros(response.data);
    } catch (error) {
      console.error('Error al cargar centros:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const mes = currentDate.getMonth() + 1;
      const año = currentDate.getFullYear();
      
      let url = `/api/actividades?mes=${mes}&año=${año}`;
      if (selectedCentro) {
        url += `&centro_id=${selectedCentro}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setActivities(response.data);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewActivity = (activity) => {
    setActivities(prev => [...prev, activity]);
  };

  const handleActivityUpdate = (updatedActivity) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === updatedActivity.id ? updatedActivity : activity
      )
    );
  };

  const handleActivityDelete = ({ id }) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convertir para que lunes sea 0

    const days = [];
    
    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate.getDate(),
        isCurrentMonth: false,
        fullDate: prevDate
      });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate: currentDate
      });
    }
    
    // Días del mes siguiente para completar la grilla
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: day,
        isCurrentMonth: false,
        fullDate: nextDate
      });
    }
    
    return days;
  };

  const getActivitiesForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return activities.filter(activity => activity.fecha === dateString);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAddActivity = (date) => {
    setSelectedDate(date);
    setSelectedActivity(null);
    setModalType('add');
    setShowModal(true);
  };

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity);
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/actividades/${activityId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Error al eliminar actividad:', error);
        alert('Error al eliminar la actividad');
      }
    }
  };

  const handleGenerateRoute = (activity) => {
    setSelectedActivity(activity);
    setModalType('route');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedActivity(null);
    setSelectedDate(null);
    setModalType('');
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/dashboard" className="back-button">
              <Home size={20} />
              Dashboard
            </Link>
            <h1>Calendario de Actividades</h1>
          </div>
          <div className="header-right">
            <div className="filter-section">
              <Filter size={16} />
              <select 
                value={selectedCentro} 
                onChange={(e) => setSelectedCentro(e.target.value)}
                className="centro-filter"
              >
                <option value="">Todos los centros</option>
                {centros.map(centro => (
                  <option key={centro.id} value={centro.id}>
                    {centro.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="user-info">
              <User size={20} />
              <span>{user.nombre}</span>
              <button className="logout-button" onClick={onLogout}>
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="calendar-controls">
        <button onClick={handlePrevMonth} className="nav-button">
          <ChevronLeft size={20} />
        </button>
        
        <h2 className="current-month">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <button onClick={handleNextMonth} className="nav-button">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-header-row">
          {weekDays.map(day => (
            <div key={day} className="calendar-header-cell">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-body">
          {days.map((day, index) => {
            const dayActivities = getActivitiesForDate(day.fullDate);
            const isCurrentMonth = day.isCurrentMonth;
            const isTodayDate = isToday(day.fullDate);
            
            return (
              <div 
                key={index} 
                className={`calendar-cell ${!isCurrentMonth ? 'other-month' : ''} ${isTodayDate ? 'today' : ''}`}
              >
                <div className="day-header">
                  <span className="day-number">{day.date}</span>
                  {isCurrentMonth && (
                    <button 
                      className="add-activity-btn"
                      onClick={() => handleAddActivity(day.fullDate)}
                      title="Agregar actividad"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
                
                <div className="activities-container">
                  {dayActivities.map(activity => (
                    <div 
                      key={activity.id} 
                      className={`activity-item ${activity.estado}`}
                      title={`${activity.titulo} - ${activity.centro_nombre}`}
                    >
                      <div className="activity-content">
                        <div className="activity-title">{activity.titulo}</div>
                        <div className="activity-time">
                          <Clock size={12} />
                          {formatTime(activity.hora_inicio)} - {formatTime(activity.hora_fin)}
                        </div>
                        <div className="activity-centro">
                          <MapPin size={12} />
                          {activity.centro_nombre}
                        </div>
                      </div>
                      
                      <div className="activity-actions">
                        <button 
                          className="action-btn edit"
                          onClick={() => handleEditActivity(activity)}
                          title="Editar"
                        >
                          <Edit size={12} />
                        </button>
                        <button 
                          className="action-btn route"
                          onClick={() => handleGenerateRoute(activity)}
                          title="Hoja de ruta"
                        >
                          <Printer size={12} />
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteActivity(activity.id)}
                          title="Eliminar"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <Modal onClose={closeModal}>
          {modalType === 'add' && (
            <ActivityForm
              centros={centros}
              selectedDate={selectedDate}
              onClose={closeModal}
              onSubmit={fetchActivities}
            />
          )}
          {modalType === 'edit' && (
            <ActivityForm
              centros={centros}
              activity={selectedActivity}
              onClose={closeModal}
              onSubmit={fetchActivities}
            />
          )}
          {modalType === 'route' && (
            <RouteSheet
              activity={selectedActivity}
              onClose={closeModal}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

export default Calendar;
