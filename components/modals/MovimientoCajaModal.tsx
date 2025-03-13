'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { supabase } from '@/lib/supabase';

interface MovimientoCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  tipo: 'ingreso' | 'egreso';
  saldoActual: number;
  onMovimientoComplete: () => void;
}

interface MovimientoCaja {
  uid: string;
  tipo: 'ingreso' | 'egreso';
  motivo: string;
  monto: number;
  saldo_anterior: number;
  saldo_actual: number;
  fecha: string;
}

export default function MovimientoCajaModal({
  isOpen,
  onClose,
  uid,
  tipo,
  saldoActual,
  onMovimientoComplete
}: MovimientoCajaModalProps) {
  const [monto, setMonto] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!monto || !motivo) {
      setError('Por favor completa todos los campos');
      return;
    }

    const montoNumerico = Number(monto);
    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      setError('El monto debe ser un número positivo');
      return;
    }

    if (tipo === 'egreso' && montoNumerico > saldoActual) {
      setError('No hay suficiente saldo en caja para realizar este egreso');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const nuevoSaldo = tipo === 'ingreso' ? 
        saldoActual + montoNumerico : 
        saldoActual - montoNumerico;

      const fecha = new Date().toISOString();
      console.log('Registrando movimiento manual con fecha:', fecha);

      const movimiento: MovimientoCaja = {
        uid,
        tipo,
        motivo,
        monto: montoNumerico,
        saldo_anterior: saldoActual,
        saldo_actual: nuevoSaldo,
        fecha
      };

      const { error: movimientoError } = await supabase
        .from('movimientos_caja')
        .insert(movimiento);

      if (movimientoError) {
        console.error('Error al registrar movimiento:', movimientoError);
        throw movimientoError;
      }

      console.log('Movimiento registrado exitosamente');
      onMovimientoComplete();
      onClose();
      setMonto('');
      setMotivo('');
    } catch (err) {
      console.error('Error al registrar movimiento:', err);
      setError('Error al registrar el movimiento. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
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
                  Registrar {tipo === 'ingreso' ? 'Ingreso' : 'Egreso'} de Caja
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
                        Monto
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          step="0.01"
                          id="monto"
                          value={monto}
                          onChange={(e) => setMonto(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="motivo" className="block text-sm font-medium text-gray-700">
                        Motivo
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="motivo"
                          value={motivo}
                          onChange={(e) => setMotivo(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Ingresa el motivo"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                              {error}
                            </h3>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          tipo === 'ingreso'
                            ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                            : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting ? 'Registrando...' : 'Registrar'}
                      </button>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
