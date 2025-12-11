// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Cartelera from './pages/Cartelera';
import Funciones from './pages/Funciones';
import Admin from './pages/Admin';
import Asientos from './pages/Asientos';
import ConfirmarReserva from './pages/ConfirmarReserva';
import ConsultarReserva from './pages/ConsultarReserva';
import GestionPeliculas from './pages/admin/GestionPeliculas';
import GestionSalas from './pages/admin/GestionSalas';
import GestionFunciones from './pages/admin/GestionFunciones';
import VerReservas from './pages/admin/VerReservas';
import UDPNotifications from './components/UDPNotifications';
import { authService } from './services/authService';

function App() {
    const user = authService.getUser();

    return (
        <Router>
            {/* Sistema de notificaciones UDP (solo para admin) */}
            {user && <UDPNotifications usuarioRol={user.rol} />}

            <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/consultar-reserva" element={<ConsultarReserva />} />

                {/* Rutas de cliente */}
                <Route path="/cartelera" element={<Cartelera />} />
                <Route path="/funciones/:peliculaId" element={<Funciones />} />
                <Route path="/asientos/:funcionId" element={<Asientos />} />
                <Route path="/confirmar-reserva" element={<ConfirmarReserva />} />

                {/* Rutas de administración */}
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/peliculas" element={<GestionPeliculas />} />
                <Route path="/admin/salas" element={<GestionSalas />} />
                <Route path="/admin/funciones" element={<GestionFunciones />} />
                <Route path="/admin/reservas" element={<VerReservas />} />

                {/* Ruta 404 */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;