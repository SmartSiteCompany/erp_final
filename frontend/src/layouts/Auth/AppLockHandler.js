import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AppLockHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      // 2 minutos de inactividad (120000 ms)
      inactivityTimer = setTimeout(lockApp, 120000);
    };

    const lockApp = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && !location.pathname.includes('/lock')) {
        localStorage.setItem('isLocked', 'true');
        localStorage.setItem('userForUnlock', JSON.stringify({
          email: user.email,
          foto_user: user.foto_user,
          name: user.name,
          apellidos: user.apellidos
        }));
        localStorage.setItem('previousPathBeforeLock', location.pathname);
        navigate('/lock');
      }
    };

    // Verificar si la app está bloqueada al cargar
    if (localStorage.getItem('isLocked') === 'true' && !location.pathname.includes('/lock')) {
      navigate('/lock');
      return;
    }

    // Configurar detectores de actividad
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // Iniciar el temporizador

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      clearTimeout(inactivityTimer);
    };
  }, [location.pathname, navigate]);

  return children;
};

export default AppLockHandler;