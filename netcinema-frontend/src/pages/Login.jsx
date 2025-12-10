import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login(username, password);

            if (response.success) {
                authService.setUser(response.data);

                if (response.data.rol === 'ADMIN') {
                    navigate('/admin');
                } else {
                    navigate('/cartelera');
                }
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError('Error al iniciar sesión. Verifica tus credenciales.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.backgroundShapes}>
                <div style={styles.shape1}></div>
                <div style={styles.shape2}></div>
            </div>

            <div style={styles.card}>
                <div style={styles.logoContainer}>
                    <span style={styles.logoIcon}>🎬</span>
                </div>

                <h1 style={styles.title}>NetCinema</h1>
                <p style={styles.subtitle}>Tu cine en línea</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            placeholder="Ingresa tu usuario"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div style={styles.errorContainer}>
                            <span style={styles.errorIcon}></span>
                            <p style={styles.error}>{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                        onMouseEnter={(e) => {
                            if (!loading) e.target.style.backgroundColor = '#5568d3';
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) e.target.style.backgroundColor = '#667eea';
                        }}
                    >
                        {loading ? (
                            <span style={styles.buttonContent}>
                <span style={styles.spinner}></span>
                Iniciando sesión...
              </span>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>
                    <div style={styles.divider}>
                        <span style={styles.dividerLine}></span>
                        <span style={styles.dividerText}>¿No tienes cuenta?</span>
                        <span style={styles.dividerLine}></span>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/registro')}
                        style={styles.registroButton}
                    >
                        Crear Cuenta Nueva
                    </button>
                </form>

            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
    },
    backgroundShapes: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    shape1: {
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        top: '-100px',
        left: '-100px',
    },
    shape2: {
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        bottom: '-150px',
        right: '-150px',
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '440px',
        width: '100%',
        position: 'relative',
        zIndex: 1,
    },
    logoContainer: {
        width: '80px',
        height: '80px',
        margin: '0 auto 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
    },
    logoIcon: {
        fontSize: '40px',
    },
    title: {
        fontSize: '36px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '8px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        textAlign: 'center',
        color: '#6c757d',
        marginBottom: '32px',
        fontSize: '14px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    inputGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: '#2c3e50',
        fontSize: '14px',
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        border: '2px solid #e9ecef',
        borderRadius: '10px',
        fontSize: '15px',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease',
        outline: 'none',
    },
    button: {
        padding: '16px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginTop: '8px',
    },
    buttonContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
    },
    spinner: {
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTop: '2px solid white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block',
    },
    errorContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#fee',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '16px',
        border: '1px solid #fcc',
    },
    errorIcon: {
        fontSize: '18px',
    },
    error: {
        color: '#c62828',
        fontSize: '14px',
        margin: 0,
        flex: 1,
    },
    testCredentials: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    credentialItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '13px',
    },
    credentialLabel: {
        fontWeight: '600',
        color: '#495057',
    },
    credentialValue: {
        color: '#6c757d',
        fontFamily: 'monospace',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        margin: '24px 0 16px',
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        backgroundColor: '#e9ecef',
    },
    dividerText: {
        padding: '0 16px',
        fontSize: '12px',
        color: '#6c757d',
        fontWeight: '500',
    },
    registroButton: {
        width: '100%',
        padding: '14px',
        backgroundColor: 'white',
        color: '#667eea',
        border: '2px solid #667eea',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
};

export default Login;