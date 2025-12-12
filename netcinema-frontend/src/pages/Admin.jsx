// src/pages/Admin.jsx - ACTUALIZADO
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function Admin() {
    const navigate = useNavigate();
    const user = authService.getUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const menuItems = [
        {
            title: 'Ver Cartelera',
            description: 'Ver todas las películas disponibles',
            path: '/cartelera',
            color: '#667eea'
        },
        {
            title: 'Gestionar Películas',
            description: 'Agregar, editar o eliminar películas',
            path: '/admin/peliculas',
            color: '#667eea'
        },
        {
            title: 'Gestionar Salas',
            description: 'Administrar salas de cine',
            path: '/admin/salas',
            color: '#667eea'
        },
        {
            title: 'Gestionar Funciones',
            description: 'Programar horarios de películas',
            path: '/admin/funciones',
            color: '#667eea'
        },
        {
            title: 'Ver Reservas',
            description: 'Consultar todas las reservas',
            path: '/admin/reservas',
            color: '#667eea'
        },
        {
            title: 'Consultar Reserva',
            description: 'Buscar reserva por código',
            path: '/consultar-reserva',
            color: '#17a2b8'
        }
    ];

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Panel de Administración</h1>
                <div style={styles.headerRight}>
          <span style={styles.userName}>
            {user?.nombre} {user?.apellido}
          </span>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <main style={styles.mainContent}>
                <div style={styles.welcomeCard}>
                    <h2 style={styles.welcomeTitle}>
                        Bienvenido al Panel de Administración
                    </h2>
                    <p style={styles.welcomeText}>
                        Aquí podrás gestionar películas, salas, funciones y reservas.
                    </p>
                </div>

                <div style={styles.menuGrid}>
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                ...styles.menuCard,
                                borderTop: `4px solid ${item.color}`
                            }}
                            onClick={() => navigate(item.path)}
                        >
                            <span style={styles.menuIcon}>{item.icon}</span>
                            <h3 style={styles.menuTitle}>{item.title}</h3>
                            <p style={styles.menuDescription}>{item.description}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: 'white',
        padding: '20px 40px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
        margin: 0,
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    userName: {
        fontSize: '14px',
        color: '#6c757d',
        fontWeight: '500',
    },
    logoutButton: {
        padding: '10px 24px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
    },
    mainContent: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px',
    },
    welcomeCard: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '40px',
        textAlign: 'center',
    },
    welcomeTitle: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '12px',
    },
    welcomeText: {
        fontSize: '16px',
        color: '#6c757d',
    },
    menuGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px',
    },
    menuCard: {
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'center',
    },
    menuIcon: {
        fontSize: '48px',
        display: 'block',
        marginBottom: '16px',
    },
    menuTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '8px',
    },
    menuDescription: {
        fontSize: '14px',
        color: '#6c757d',
    },
};

export default Admin;