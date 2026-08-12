import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  // If isOpen is false, render nothing at all
  if (!isOpen) return null;

  return (
    // Full screen dark overlay behind the modal
    <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
      {/* Modal card, max width so it doesn't stretch on large screens */}
      <div className='bg-white rounded-xl shadow-xl w-full max-w-md max-h-screen overflow-y-auto'>
        {/* Modal header with title and close button */}
        <div className='flex items-center justify-between p-6 border-b border-gray-100'>
          <h3 className='text-base font-semibold text-gray-900'>{title}</h3>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal body, whatever the parent passes as children */}
        <div className='p-6'>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
