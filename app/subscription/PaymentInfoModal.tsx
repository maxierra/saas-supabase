import React from 'react';

interface PaymentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentInfoModal: React.FC<PaymentInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>

        <div className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full bg-white border border-gray-300">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9.586l-4.293-4.293a1 1 0 00-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 001.414 1.414L10 11.414l4.293 4.293a1 1 0 001.414-1.414L11.414 10l4.293-4.293a1 1 0 00-1.414-1.414L10 8.586z" clipRule="evenodd" /></svg>
            </button>
          </div>
          <div className="px-6 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
            <h4 className="text-xl font-semibold text-gray-900 mb-4">Información de Pago</h4>
            <div className="space-y-4">
              <div className="bg-blue-100 p-4 rounded-lg shadow-md">
                <p className="text-blue-800 font-medium">Realiza tu pago mediante el siguiente enlace:</p>
                <p className="text-yellow-800">Pagar aquí: <a href="https://mpago.la/2549ciY" className="text-blue-600 underline" target="_blank">Pagar aquí</a></p>
                <div className="mt-2 space-y-2 text-sm">
                  <p><span className="font-semibold">Titular:</span> Maximiliano Erramouspe</p>
                  <p><span className="font-semibold">CVU:</span> 0000003100115778926833</p>
                  <p><span className="font-semibold">Alias:</span> tienda369.mp</p>
                  <p><span className="font-semibold">CUIT/CUIL:</span> 20255933923</p>
                </div>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg shadow-md">
                <p className="text-yellow-800">Una vez realizado el pago, envíanos el comprobante a: <span className="font-medium mt-1">administracion@tienda360website.com</span></p>
                <p className="text-sm mt-2 text-yellow-700">Activaremos tu cuenta al instante.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfoModal;
