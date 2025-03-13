'use client';

import { Fragment, useState, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface GramosInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (gramos: number) => void;
  productoNombre: string;
  precioPorGramo: number;
}

export default function GramosInputModal({
  isOpen,
  onClose,
  onConfirm,
  productoNombre,
  precioPorGramo
}: GramosInputModalProps) {
  const [gramos, setGramos] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Calcular el subtotal basado en los gramos ingresados
  const subtotal = gramos && !isNaN(Number(gramos)) && Number(gramos) > 0
    ? (Number(gramos) * precioPorGramo).toFixed(2)
    : '0.00';

  // Focus en el input cuando se abre el modal
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Resetear el estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setGramos('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!gramos || isNaN(Number(gramos)) || Number(gramos) <= 0) {
      setError('Por favor, ingrese una cantidad válida mayor a cero');
      return;
    }
    
    onConfirm(Number(gramos));
    onClose();
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
                  Ingrese cantidad para {productoNombre}
                </Dialog.Title>
                
                <div className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="gramos" className="block text-sm font-medium text-gray-700">
                        Cantidad en gramos
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="number"
                          id="gramos"
                          ref={inputRef}
                          value={gramos}
                          onChange={(e) => {
                            setGramos(e.target.value);
                            setError(null);
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSubmit();
                            }
                          }}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md"
                          placeholder="0"
                          min="1"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">g</span>
                        </div>
                      </div>
                      {error && (
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                      )}
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Precio por gramo:</span>
                        <span className="text-sm font-medium">${precioPorGramo.toFixed(2)}/g</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">Subtotal:</span>
                        <span className="text-sm font-medium">${subtotal}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    onClick={handleSubmit}
                  >
                    Confirmar
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
