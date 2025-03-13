'use client';

import { useEffect, useState } from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [label, setLabel] = useState('');

  useEffect(() => {
    // Evaluar la fortaleza de la contraseña
    const calculateStrength = () => {
      if (!password) {
        setStrength(0);
        setLabel('');
        return;
      }

      let score = 0;

      // Criterios de evaluación
      if (password.length >= 8) score += 1;
      if (password.length >= 12) score += 1;
      if (/[A-Z]/.test(password)) score += 1;
      if (/[0-9]/.test(password)) score += 1;
      if (/[^A-Za-z0-9]/.test(password)) score += 1;

      // Normalizar puntuación a un valor entre 0 y 100
      const normalizedScore = Math.min(100, (score / 5) * 100);
      setStrength(normalizedScore);

      // Establecer etiqueta según la puntuación
      if (normalizedScore === 0) {
        setLabel('');
      } else if (normalizedScore <= 33) {
        setLabel('Débil');
      } else if (normalizedScore <= 66) {
        setLabel('Media');
      } else {
        setLabel('Fuerte');
      }
    };

    calculateStrength();
  }, [password]);

  // Determinar el color según la fortaleza
  const getColor = () => {
    if (strength === 0) return 'bg-gray-200';
    if (strength <= 33) return 'bg-red-500';
    if (strength <= 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2 mb-4">
      <div className="flex items-center justify-between mb-1">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColor()} transition-all duration-300 ease-in-out`} 
            style={{ width: `${strength}%` }}
          ></div>
        </div>
        {label && (
          <span className="text-xs ml-2 min-w-16 text-right">{label}</span>
        )}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;