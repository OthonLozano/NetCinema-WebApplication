import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function Registro() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        nombre: '',
        apellido: '',
        telefono: '',
        rol: 'CLIENTE',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            setError('El username es obligatorio');
            return false;
        }

        if (!formData.email.trim()) {
            setError('El email es obligatorio');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('El email no es válido');
            return false;
        }

        if (!formData.password) {
            setError('La contraseña es obligatoria');
            return false;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }

        if (!formData.nombre.trim()) {
            setError('El nombre es obligatorio');
            return false;
        }

        if (!formData.apellido.trim()) {
            setError('El apellido es obligatorio');
            return false;
        }

        if (!formData.telefono.trim()) {
            setError('El teléfono es obligatorio');
            return false;
        }

        const telefonoRegex = /^[0-9]{10}$/;
        if (!telefonoRegex.test(formData.telefono)) {
            setError('El teléfono debe tener 10 dígitos');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const userData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                nombre: formData.nombre,
                apellido: formData.apellido,
                telefono: formData.telefono,
                rol: formData.rol,
            };

            const response = await authService.register(userData);

            if (response.success) {
                alert('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
                navigate('/');
            } else {
                setError(response.message || 'Error al crear la cuenta');
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Error al crear la cuenta. Por favor intenta de nuevo.');
            }
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

                <h1 style={styles.title}>Crear Cuenta</h1>
                <p style={styles.subtitle}>Únete a NetCinema</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Nombre *</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                style={styles.input}
                                placeholder="Juan"
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Apellido *</label>
                            <input
                                type="text"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleInputChange}
                                style={styles.input}
                                placeholder="Pérez"
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Usuario *</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            style={styles.input}
                            placeholder="juanperez"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            style={styles.input}
                            placeholder="juan@example.com"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Teléfono *</label>
                        <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleInputChange}
                            style={styles.input}
                            placeholder="5512345678"
                            maxLength="10"
                            required
                        />
                        <p style={styles.hint}>10 dígitos sin espacios</p>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Contraseña *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                style={styles.input}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Confirmar contraseña *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                style={styles.input}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={styles.errorContainer}>
                            <span style={styles.errorIcon}>⚠️</span>
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
                Creando cuenta...
              </span>
                        ) : (
                            'Crear Cuenta'
                        )}
                    </button>
                </form>

                <div style={styles.divider}>
                    <span style={styles.dividerLine}></span>
                    <span style={styles.dividerText}>¿Ya tienes cuenta?</span>
                    <span style={styles.dividerLine}></span>
                </div>

                <button onClick={() => navigate('/')} style={styles.loginLink}>
                    Iniciar Sesión
                </button>
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
        maxWidth: '600px',
        width: '100%',
        position: 'relative',
        zIndex: 1,
        maxHeight: '90vh',
        overflowY: 'auto',
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
        gap: '20px',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#2c3e50',
    },
    input: {
        padding: '12px 14px',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        transition: 'all 0.3s ease',
    },
    select: {
        padding: '12px 14px',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    hint: {
        fontSize: '11px',
        color: '#6c757d',
        margin: 0,
    },
    button: {
        padding: '14px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '15px',
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
        border: '1px solid #fcc',
    },
    errorIcon: {
        fontSize: '18px',
    },
    error: {
        color: '#c62828',
        fontSize: '13px',
        margin: 0,
        flex: 1,
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
    loginLink: {
        width: '100%',
        padding: '12px',
        backgroundColor: 'white',
        color: '#667eea',
        border: '2px solid #667eea',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
};

export default Registro;