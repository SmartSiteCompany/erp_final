import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const useInactivity = (timeout = 300) => { // 15 minutos por defecto
  const { lockScreen } = useAuth();

  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        lockScreen();
      }, timeout);
    };

    // Eventos que resetearán el temporizador
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // Iniciar el temporizador

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [lockScreen, timeout]);
};

export default useInactivity;