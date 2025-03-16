'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal = ({ isOpen, onClose }: InfoModalProps) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full bg-white">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <span className="sr-only">Cerrar</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-3xl leading-6 font-bold text-center text-gray-900 mb-2" id="modal-title">
                  <span className="text-blue-600">Bienvenidos a Tienda 360 🌟</span>
                </h3>
                <p className="text-center text-gray-700 text-lg mb-4 bg-blue-100 p-2 rounded">
                  <span className="text-green-600">Tu aliado en el camino hacia el éxito comercial.</span>
                </p>
                <p className="text-center text-gray-700 text-lg mb-4 bg-yellow-100 p-2 rounded">
                  <span className="text-yellow-500">En Tienda 360, sabemos lo difícil que es gestionar un comercio sin las herramientas adecuadas.</span> Por eso, hemos creado una solución simple, accesible y asequible para ayudarte a llevar las finanzas de tu negocio sin complicaciones.
                </p>
                <h4 className="text-xl font-semibold text-gray-800 mb-2 bg-red-100 p-2 rounded">
                  <span className="text-red-500">¿Por qué elegirnos?</span>
                </h4>
                <ul className="list-disc list-inside text-gray-700 mb-4 bg-green-100 p-2 rounded">
                  <li><strong className="text-blue-600">Fácil de Usar:</strong> Sabemos que no todos son expertos en tecnología, por eso nuestro software está diseñado para ser intuitivo.</li>
                  <li><strong className="text-blue-600">Asequible:</strong> Ofrecemos una opción económica sin comprometer la calidad.</li>
                  <li><strong className="text-blue-600">Diseñado para Pequeños y Medianos Comercios:</strong> Nuestro enfoque está en tiendas como la tuya.</li>
                </ul>
                <h4 className="text-xl font-semibold text-gray-800 mb-2 bg-red-100 p-2 rounded">
                  <span className="text-red-500">¿Qué ofrecemos?</span>
                </h4>
                <ul className="list-disc list-inside text-gray-700 mb-4 bg-green-100 p-2 rounded">
                  <li><strong className="text-blue-600">Gestión de Finanzas:</strong> Controla tus ingresos, egresos, pagos a proveedores y más.</li>
                  <li><strong className="text-blue-600">Informes Detallados:</strong> Recibe reportes claros y precisos.</li>
                  <li><strong className="text-blue-600">Soporte Amigable:</strong> Estamos contigo en todo momento.</li>
                </ul>
                <h4 className="text-xl font-semibold text-gray-800 mb-2 bg-red-100 p-2 rounded">
                  <span className="text-red-500">Lo que dicen nuestros clientes 💬</span>
                </h4>
                <p className="text-gray-700 mb-2 bg-green-100 p-2 rounded">“Tienda 360 ha transformado la manera en que gestionamos nuestras finanzas.” – Carlos, Tienda de Ropa</p>
                <p className="text-gray-700 mb-4 bg-green-100 p-2 rounded">“Con Tienda 360, tengo todo lo que necesito a un precio que puedo pagar.” – Ana, Tienda de Electrodomésticos</p>
                <h4 className="text-xl font-semibold text-gray-800 mb-2 bg-red-100 p-2 rounded">
                  <span className="text-red-500">¡Haz crecer tu negocio con Tienda 360!</span>
                </h4>
                <p className="text-gray-700 mb-4 bg-yellow-100 p-2 rounded">Si eres un pequeño o mediano comerciante que busca gestionar tus finanzas de manera eficiente, ¡estamos aquí para ayudarte!</p>
                <ul className="list-disc list-inside text-gray-700 mb-4 bg-green-100 p-2 rounded">
                  <li><strong className="text-blue-600">Sin costos ocultos:</strong> Precios transparentes y accesibles.</li>
                  <li><strong className="text-blue-600">¡Fácil integración!</strong> Te ayudamos a configurar todo.</li>
                  <li><strong className="text-blue-600">Prueba Gratis:</strong> Comienza hoy mismo con una prueba gratuita.</li>
                </ul>
                <h4 className="text-xl font-semibold text-gray-800 mb-2 bg-red-100 p-2 rounded">
                  <span className="text-red-500">Únete a nuestra comunidad</span>
                </h4>
                <p className="text-gray-700 bg-yellow-100 p-2 rounded">En Tienda 360, nos importa el crecimiento de tu negocio. Somos más que una tienda de software; somos tu socio en el camino hacia el éxito.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
