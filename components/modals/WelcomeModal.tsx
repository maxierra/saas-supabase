'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  autoCloseTime?: number; // Tiempo en ms para cerrar automáticamente
}

const WelcomeModal = ({ isOpen, onClose, email, autoCloseTime = 5000 }: WelcomeModalProps) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [timeLeft, setTimeLeft] = useState(Math.ceil(autoCloseTime / 1000));

  // Efecto para manejar la visibilidad del modal
  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  // Efecto para cerrar automáticamente el modal después de un tiempo
  useEffect(() => {
    if (!isVisible) return;
    
    // Configurar temporizador para cerrar el modal
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseTime);
    
    // Actualizar el contador de tiempo restante
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Limpiar temporizadores al desmontar
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isVisible, onClose, autoCloseTime]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        {/* Overlay semi-transparente */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 transition-opacity backdrop-blur-sm" aria-hidden="true"></div>

        {/* Modal */}
        <div className="inline-block align-middle bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircleIcon className="h-10 w-10 text-green-600" aria-hidden="true" />
            </div>
            
            <h3 className="text-3xl font-extrabold text-white mb-2">
              ¡Nos encanta que pruebes nuestra plataforma!
            </h3>
            
            <p className="text-xl text-white mb-4">
              Una vez redirigido a la página, estarás listo para usar la plataforma. ¡Disfrútala!
            </p>
            
            <div className="text-sm text-white mb-4">
              Serás redirigido a la página de inicio de sesión en <span className="font-bold">{timeLeft}</span> segundos...
            </div>
            
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="confetti">
                {/* Aquí puedes agregar un efecto de confeti usando CSS o una biblioteca de efectos */}
              </div>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none"
            >
              Ir ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
