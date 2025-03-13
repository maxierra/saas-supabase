'use client';

import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useReactToPrint } from 'react-to-print';

interface ProductoEnTicket {
  codigo_producto: string;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  es_peso?: boolean;
}

interface DatosComercio {
  nombre_comercio: string;
  direccion?: string | null;
  telefono?: string | null;
  cuit?: string | null;
  descripcion?: string | null;
  numero_facturacion?: number;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  productos: ProductoEnTicket[];
  total: number;
  metodoPago: string;
  datosComercio: DatosComercio | null;
  numeroTicket: number;
}

export default function TicketModal({
  isOpen,
  onClose,
  productos,
  total,
  metodoPago,
  datosComercio,
  numeroTicket
}: TicketModalProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    onAfterPrint: () => {
      onClose();
    }
  });

  // Formatear método de pago para mostrar en el ticket
  const getMetodoPagoTexto = (metodo: string) => {
    switch (metodo) {
      case 'efectivo': return 'Efectivo';
      case 'tarjeta_credito': return 'Tarjeta de Crédito';
      case 'tarjeta_debito': return 'Tarjeta de Débito';
      case 'mercado_pago': return 'Mercado Pago';
      default: return metodo;
    }
  };

  // Formatear número de ticket con formato 0000-XXXX
  const formatearNumeroTicket = (numero: number) => {
    return `0000-${numero.toString().padStart(4, '0')}`;
  };

  // Formatear fecha actual
  const formatearFecha = () => {
    const fecha = new Date();
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatear hora actual
  const formatearHora = () => {
    const fecha = new Date();
    return fecha.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Vista previa del Ticket
                </Dialog.Title>
                
                <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                  {/* Contenido del ticket que se imprimirá */}
                  <div ref={ticketRef} className="p-4 text-sm font-mono" style={{ width: '80mm', margin: '0 auto' }}>
                    {/* Encabezado del ticket */}
                    <div className="text-center mb-4">
                      <h2 className="text-lg font-bold">{datosComercio?.nombre_comercio || 'Mi Negocio'}</h2>
                      {datosComercio?.direccion && <p>{datosComercio.direccion}</p>}
                      {datosComercio?.telefono && <p>Tel: {datosComercio.telefono}</p>}
                      {datosComercio?.cuit && <p>CUIT: {datosComercio.cuit}</p>}
                      <p className="mt-2">TICKET N°: {formatearNumeroTicket(numeroTicket)}</p>
                      <p>Fecha: {formatearFecha()} - Hora: {formatearHora()}</p>
                      <div className="border-b border-dashed my-2"></div>
                    </div>

                    {/* Detalle de productos */}
                    <div className="mb-4">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b">
                            <th className="py-1">Producto</th>
                            <th className="py-1 text-right">Cant.</th>
                            <th className="py-1 text-right">Precio</th>
                            <th className="py-1 text-right">Subt.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productos.map((producto, index) => (
                            <tr key={index} className="border-b border-dotted">
                              <td className="py-1">{producto.nombre}</td>
                              <td className="py-1 text-right">
                                {producto.es_peso 
                                  ? `${producto.cantidad}g` 
                                  : producto.cantidad}
                              </td>
                              <td className="py-1 text-right">
                                ${producto.precio_unitario.toFixed(2)}
                                {producto.es_peso && '/g'}
                              </td>
                              <td className="py-1 text-right">${producto.subtotal.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Total y forma de pago */}
                    <div className="mb-4">
                      <div className="border-b border-dashed my-2"></div>
                      <div className="flex justify-between font-bold">
                        <span>TOTAL:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Forma de pago:</span>
                        <span>{getMetodoPagoTexto(metodoPago)}</span>
                      </div>
                    </div>

                    {/* Pie del ticket */}
                    <div className="text-center mt-4">
                      <div className="border-b border-dashed my-2"></div>
                      <p>{datosComercio?.descripcion || ''}</p>
                      <p className="mt-2">¡Gracias por su compra!</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 focus:outline-none"
                    onClick={onClose}
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
                    onClick={handlePrint}
                  >
                    Imprimir
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
