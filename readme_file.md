# Sistema de Calendarización para Centros de Salud

Sistema completo para la gestión y calendarización de actividades en centros de salud, con funcionalidades de tiempo real, múltiples usuarios y generación de hojas de ruta.

## Características

- 📅 **Calendario interactivo** con vista mensual
- 🏥 **Gestión de 6 centros de salud**
- 👥 **Múltiples usuarios en tiempo real**
- 📋 **Generación de hojas de ruta imprimibles**
- 💾 **Persistencia de datos** para auditorías y facturación
- 🔐 **Sistema de autenticación** seguro
- 📱 **Responsive design** para móviles y tablets

## Tecnologías Utilizadas

### Backend
- **Node.js** con Express
- **PostgreSQL** como base de datos
- **Socket.io** para tiempo real
- **JWT** para autenticación
- **bcryptjs** para encriptación de contraseñas

### Frontend
- **React 18** con hooks
- **React Router** para navegación
- **Socket.io-client** para tiempo real
- **Axios** para peticiones HTTP
- **Lucide React** para iconos

## Instalación Local

### Prerrequisitos
- Node.js (versión 18 o superior)
- PostgreSQL
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd calendario-centros-salud
```

2. **Instalar dependencias del backend**
```bash
npm install
```

3. **Instalar dependencias del frontend**
```bash
cd client
npm install
cd ..
```

4. **Configurar variables de entorno**
Crea un archivo `.env` en la raíz del proyecto:
```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/centros_salud
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
NODE_ENV=development
PORT=5000
```

5. **Configurar la base de datos**
- Crea una base de datos PostgreSQL llamada `centros_salud`
- El sistema creará automáticamente las tablas necesarias al iniciar

6. **Ejecutar en modo desarrollo**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Despliegue en Railway

### Paso 1: Preparar el proyecto
1. Sube tu código a GitHub
2. Asegúrate de que todos los archivos estén incluidos

### Paso 2: Crear proyecto en Railway
1. Ve a [Railway.app](https://railway.app)
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio

### Paso 3: Configurar la base de datos
1. En tu proyecto de Railway, haz clic en "New Service"
2. Selecciona "Database" → "PostgreSQL"
3. Railway generará automáticamente la `DATABASE_URL`

### Paso 4: Configurar variables de entorno
En la pestaña "Variables" de tu servicio principal, agrega:
```
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
NODE_ENV=production
```

### Paso 5: Desplegar
1. Railway detectará automáticamente el `package.json`
2. Ejecutará `npm install` y `npm run build`
3. Iniciará el servidor con `npm start`

## Credenciales por Defecto

Al inicializar la base de datos, se crea un usuario administrador:
- **Usuario:** admin
- **Contraseña:** admin123

## Estructura del Proyecto

```
├── server.js              # Servidor principal
├── package.json           # Dependencias del backend
├── .env                   # Variables de entorno
├── railway.json           # Configuración de Railway
├── client/                # Aplicación React
│   ├── public/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── App.js         # Componente principal
│   │   ├── App.css        # Estilos principales
│   │   └── index.js       # Punto de entrada
│   └── package.json       # Dependencias del frontend
└── README.md
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Centros de Salud
- `GET /api/centros` - Obtener todos los centros

### Actividades
- `GET /api/actividades` - Obtener actividades (con filtros)
- `POST /api/actividades` - Crear nueva actividad
- `PUT /api/actividades/:id` - Actualizar actividad
- `DELETE /api/actividades/:id` - Eliminar actividad

### Hojas de Ruta
- `POST /api/hojas-ruta` - Crear hoja de ruta
- `GET /api/hojas-ruta/:actividad_id` - Obtener hoja de ruta

## Funcionalidades Principales

### 1. Gestión de Actividades
- Crear, editar y eliminar actividades
- Asignar actividades a centros específicos
- Definir horarios y estados
- Filtrar por centro de salud

### 2. Calendario Interactivo
- Vista mensual con navegación
- Actividades codificadas por colores según estado
- Acciones rápidas desde cada día
- Responsive para todos los dispositivos

### 3. Hojas de Ruta
- Generación automática de hojas de ruta
- Información detallada de la actividad
- Campos para datos operativos (kilometraje, combustible, etc.)
- Función de impresión optimizada

### 4. Tiempo Real
- Sincronización automática entre usuarios
- Actualizaciones instantáneas de cambios
- Notificaciones de nuevas actividades

### 5. Sistema de Usuarios
- Autenticación segura con JWT
- Sesiones persistentes
- Control de acceso por roles

## Solución de Problemas

### Error de conexión a la base de datos
- Verifica que la `DATABASE_URL` sea correcta
- Asegúrate de que PostgreSQL esté ejecutándose
- Revisa los logs para más detalles

### Problemas de build en Railway
- Verifica que `package.json` tenga los scripts correctos
- Asegúrate de que todas las dependencias estén listadas
- Revisa los logs de build en Railway

### Problemas de Socket.io en producción
- Verifica que el dominio en la configuración de CORS sea correcto
- Asegúrate de que Railway permita conexiones WebSocket

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## Soporte

Para reportar bugs o solicitar nuevas funcionalidades, por favor crea un issue en el repositorio.

---

**Desarrollado para la gestión eficiente de actividades en centros de salud** 🏥