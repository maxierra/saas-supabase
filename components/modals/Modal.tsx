import React, { useEffect } from 'react';
import Modal from 'react-modal';

interface BlankModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
}

// Cambiar el nombre del modal a UsoDelSistema
const UsoDelSistema: React.FC<BlankModalProps> = ({ isOpen, onRequestClose }) => {
    useEffect(() => {
        const appElement = document.getElementById('__next');
        if (appElement) {
            Modal.setAppElement('#__next');
        }
    }, []);

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
            <h2 className="text-center">Uso del Sistema</h2>
            <h3 className="text-center">Registro</h3>
            <p className="text-center">Instrucciones sobre cómo registrarse.</p>
            <div className="flex justify-center mb-4">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/M-aUC47rcs0" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
            <h3 className="text-center">Instrucciones para Comenzar a Usar el Sistema</h3>
            <p className="text-center">Instrucciones sobre cómo comenzar a usar el sistema.</p>
            <div className="flex justify-center mb-4">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/fKK62jAPARg" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
            <h3 className="text-center">Carga de Productos</h3>
            <p className="text-center">Instrucciones sobre cómo cargar productos en el sistema.</p>
            <div className="flex justify-center mb-4">
                
            </div>
            <div className="flex justify-center mb-4">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/ZSxP-OwR2LQ" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
            <h3 className="text-center">Realizando Nuestra Primera Venta</h3>
            <p className="text-center">Instrucciones sobre cómo realizar tu primera venta en el sistema.</p>
            <div className="flex justify-center mb-4">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/Uv9GtrG9WxU" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
            <h3 className="text-center">Gestión de Caja Diaria</h3>
            <p className="text-center">Instrucciones sobre cómo gestionar la caja diaria en el sistema.</p>
            <div className="flex justify-center mb-4">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/t92KTLVWCV4" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
            <button onClick={onRequestClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Cerrar</button>
        </Modal>
    );
};

export default UsoDelSistema;
