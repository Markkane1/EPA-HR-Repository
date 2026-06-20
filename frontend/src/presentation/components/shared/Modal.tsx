import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-3xl' }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[1050] flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none p-4">
        <div className={`relative w-auto my-6 mx-auto ${maxWidth} w-full animate-fade-in`}>
          {/* Modal content */}
          <div className="relative flex flex-col w-full bg-white bg-clip-padding border border-[rgba(0,0,0,0.2)] rounded-[0.3rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] outline-none">
            {/* Modal header */}
            <div className="flex items-start justify-between p-[1rem] border-b border-[#e3e6f0] rounded-t-[0.3rem]">
              <h5 className="mb-0 leading-[1.5] text-[#5a5c69] font-bold text-xl">{title}</h5>
              <button 
                type="button" 
                className="p-[1rem] -m-[1rem] bg-transparent border-0 float-right text-[1.5rem] font-bold leading-none text-[#858796] opacity-50 hover:text-black hover:opacity-75 transition-all cursor-pointer" 
                onClick={onClose} 
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            
            {/* Modal body */}
            <div className="relative flex-auto p-[1rem] text-[#858796] max-h-[calc(100vh-8rem)] overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 z-[1040] bg-black opacity-50 transition-opacity"></div>
    </>
  );
};
