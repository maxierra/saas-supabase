'use client';

import { useState, useEffect } from 'react';
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
        <div className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-lg mb-6 shadow-lg">
                  <h3 className="text-3xl leading-6 font-bold text-center text-white mb-2" id="modal-title">
                    Bienvenidos a Tienda 360 🌟
                  </h3>
                  <p className="text-center text-indigo-100 text-lg">
                    Tu aliado en el camino hacia el éxito comercial.
                  </p>
                </div>
                
                <div className="mt-4 text-gray-700 space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
                    <p className="mb-4 text-gray-700">
                      En Tienda 360, sabemos lo difícil que es gestionar un comercio sin las herramientas adecuadas. 
                      Por eso, hemos creado una solución simple, accesible y asequible para ayudarte a llevar las finanzas 
                      de tu negocio sin complicaciones.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-lg shadow-md">
                    <h4 className="text-xl font-semibold text-white mb-4">¿Por qué elegirnos?</h4>
                    <ul className="list-disc pl-5 space-y-3 text-white">
                      <li><span className="font-medium text-indigo-100">Fácil de Usar:</span> Sabemos que no todos son expertos en tecnología, por eso nuestro software está diseñado para ser intuitivo. No necesitas ser un genio en computación para aprovechar sus funciones.</li>
                      <li><span className="font-medium text-indigo-100">Asequible:</span> Sabemos que los recursos son limitados, por eso ofrecemos una opción económica sin comprometer la calidad. ¡Porque creemos que todos merecen tener acceso a herramientas profesionales!</li>
                      <li><span className="font-medium text-indigo-100">Diseñado para Pequeños y Medianos Comercios:</span> Nuestro enfoque está en tiendas como la tuya. No necesitas invertir grandes cantidades de dinero, nosotros te damos todo lo que necesitas para llevar el control financiero de manera eficaz y sencilla.</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-lg shadow-md">
                    <h4 className="text-xl font-semibold text-white mb-4">¿Qué ofrecemos?</h4>
                    <ul className="list-disc pl-5 space-y-3 text-white">
                      <li><span className="font-medium text-blue-100">Gestión de Finanzas al alcance de tu mano:</span> Controla tus ingresos, egresos, pagos a proveedores y más.</li>
                      <li><span className="font-medium text-blue-100">Informes Detallados:</span> Recibe reportes claros y precisos para tomar decisiones rápidas y acertadas.</li>
                      <li><span className="font-medium text-blue-100">Soporte Amigable:</span> Estamos contigo en todo momento. Nuestro equipo de soporte está listo para ayudarte con cualquier duda o problema.</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-lg shadow-md">
                    <h4 className="text-xl font-semibold text-white mb-4">Lo que dicen nuestros clientes 💬</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                        <p className="italic text-white">"Tienda 360 ha transformado la manera en que gestionamos nuestras finanzas. El software es tan fácil de usar, ¡y ahora tenemos el control total de nuestras ventas y gastos!"</p>
                        <p className="font-medium mt-2 text-amber-100">– Carlos, Tienda de Ropa</p>
                      </div>
                      <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                        <p className="italic text-white">"Como pequeño comerciante, no podía permitirme herramientas caras. Con Tienda 360, tengo todo lo que necesito a un precio que puedo pagar."</p>
                        <p className="font-medium mt-2 text-amber-100">– Ana, Tienda de Electrodomésticos</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 rounded-lg shadow-md">
                    <h4 className="text-xl font-semibold text-white mb-4">¡Haz crecer tu negocio con Tienda 360!</h4>
                    <p className="mb-4 text-white">
                      Si eres un pequeño o mediano comerciante que busca gestionar tus finanzas de manera eficiente, 
                      sin invertir grandes sumas de dinero, ¡estamos aquí para ayudarte!
                    </p>
                    
                    <ul className="list-disc pl-5 space-y-3 text-white">
                      <li><span className="font-medium text-green-100">Sin costos ocultos:</span> Lo que ves es lo que pagas. Precios transparentes y accesibles.</li>
                      <li><span className="font-medium text-green-100">¡Fácil integración!:</span> No necesitas conocimientos técnicos para comenzar. Te ayudamos a configurar todo.</li>
                      <li><span className="font-medium text-green-100">Prueba Gratis:</span> Comienza hoy mismo con una prueba gratuita. ¡Descubre cómo Tienda 360 puede transformar tu negocio!</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg shadow-md">
                    <h4 className="text-xl font-semibold text-white mb-4">Únete a nuestra comunidad</h4>
                    <p className="mb-4 text-white">
                      En Tienda 360, nos importa el crecimiento de tu negocio. Somos más que una tienda de software; 
                      somos tu socio en el camino hacia el éxito. Únete hoy y empieza a gestionar las finanzas de tu comercio con facilidad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-white text-base font-medium text-indigo-700 hover:bg-indigo-50 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Entendido
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-indigo-300 shadow-sm px-4 py-2 bg-indigo-700 text-base font-medium text-white hover:bg-indigo-800 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
