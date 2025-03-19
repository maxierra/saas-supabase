import React, { useState } from 'react';
import Modal from 'react-modal';

const VideoModal = ({ isOpen, closeModal }: { isOpen: boolean; closeModal: () => void; }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={closeModal} contentLabel="Videos de Ayuda">
      <button onClick={closeModal} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>X</button>
      <h2>Aprendiendo a usar el sistema</h2>
      <div>
        <h3>Registro y Login</h3>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/TzBls9UBwgY" frameBorder="0" allowFullScreen></iframe>
        <h3>Configuraciones Principales</h3>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/fKK62jAPARg" frameBorder="0" allowFullScreen></iframe>
        <h3>Carga de Productos</h3>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/ZSxP-OwR2LQ" frameBorder="0" allowFullScreen></iframe>
        <h3>Realizando Nuestra Primera Venta</h3>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/Uv9GtrG9WxU" frameBorder="0" allowFullScreen></iframe>
        <h3>Gestión de Caja Diaria</h3>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/SpMKGPPb7QY" frameBorder="0" allowFullScreen></iframe>
        <h3>Proveedores</h3>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/trV_96OpTsY" frameBorder="0" allowFullScreen></iframe>
        <h3>Generar Etiquetas</h3>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/jIqfFsukDx4" frameBorder="0" allowFullScreen></iframe>
        <h3>Dashboard</h3>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/qH84WY-vPlM" frameBorder="0" allowFullScreen></iframe>
      </div>
      <button onClick={closeModal}>Cerrar</button>
    </Modal>
  );
};

export default VideoModal;
