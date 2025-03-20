import React from 'react';
import Modal from 'react-modal';

const AboutModal = ({ isOpen, closeModal }: { isOpen: boolean; closeModal: () => void; }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={closeModal} contentLabel="Sobre Nosotros">
      <button onClick={closeModal} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>X</button>
      <div className="text-gray-800 p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Sobre Nosotros – Tienda 360</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-blue-500">Nuestra Historia</h3>
          <p className="text-gray-600 mb-4">Fundada con la visión de revolucionar la gestión comercial, Tienda 360 nace de la necesidad de proporcionar a los comerciantes una herramienta integral que simplifique sus operaciones diarias. Nuestra trayectoria está marcada por la innovación constante y el compromiso con el éxito de nuestros clientes.</p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-blue-500">Misión</h3>
          <p className="text-gray-600 mb-4">Empoderar a los comerciantes con soluciones tecnológicas intuitivas y eficientes que impulsen el crecimiento de sus negocios, facilitando la gestión integral y la toma de decisiones informadas.</p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-blue-500">Visión</h3>
          <p className="text-gray-600 mb-4">Ser el referente líder en soluciones de gestión comercial, reconocidos por nuestra innovación, excelencia en el servicio y el impacto positivo en el éxito de nuestros clientes.</p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-blue-500">Valores</h3>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Innovación continua en nuestras soluciones</li>
            <li>Compromiso con la excelencia en el servicio</li>
            <li>Integridad en todas nuestras operaciones</li>
            <li>Enfoque en el éxito del cliente</li>
            <li>Adaptabilidad a las necesidades del mercado</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-blue-500">Nuestro Compromiso</h3>
          <p className="text-gray-600">En Tienda 360, nos dedicamos a proporcionar soluciones que no solo satisfacen las necesidades actuales de nuestros clientes, sino que también anticipan los desafíos futuros del mercado. Nuestro compromiso con la excelencia se refleja en cada característica de nuestro software y en el soporte personalizado que brindamos.</p>
        </div>
      </div>
      </div>
    </Modal>
  );
};

export default AboutModal;
