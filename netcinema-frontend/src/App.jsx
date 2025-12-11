import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Cartelera from './pages/Cartelera';
import Funciones from './pages/Funciones';
import Admin from './pages/Admin';
import Asientos from './pages/Asientos';
import ConfirmarReserva from './pages/ConfirmarReserva';
import GestionPeliculas from './pages/admin/GestionPeliculas'; // 🆕

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/cartelera" element={<Cartelera />} />
                <Route path="/funciones/:peliculaId" element={<Funciones />} />
                <Route path="/asientos/:funcionId" element={<Asientos />} />
                <Route path="/confirmar-reserva" element={<ConfirmarReserva />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/peliculas" element={<GestionPeliculas />} /> {/* 🆕 */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;