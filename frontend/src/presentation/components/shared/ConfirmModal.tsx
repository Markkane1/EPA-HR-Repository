import React from 'react';
import { Modal } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  isDestructive = false,
  isLoading = false,
  onConfirm, 
  onClose 
}: ConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="text-center py-4">
        <p className="text-xl font-light text-[#5a5c69] leading-relaxed">{message}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center p-[0.75rem] gap-2 pt-0">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="inline-block font-normal text-center align-middle cursor-pointer select-none border border-transparent py-[0.375rem] px-[0.75rem] text-[1rem] leading-[1.5] rounded-[0.35rem] transition-colors text-white bg-[#858796] hover:bg-[#717384]"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`inline-flex items-center justify-center font-normal text-center align-middle cursor-pointer select-none border border-transparent py-[0.375rem] px-[0.75rem] text-[1rem] leading-[1.5] rounded-[0.35rem] transition-colors text-white ${isDestructive ? 'bg-[#e74a3b] hover:bg-[#e02d1b]' : 'bg-[#4e73df] hover:bg-[#2e59d9]'}`}
        >
          {isLoading && <i className="fas fa-circle-notch fa-spin mr-2"></i>}
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
