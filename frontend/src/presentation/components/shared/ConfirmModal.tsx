import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
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
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
          <AlertTriangle className="w-8 h-8" />
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
      </div>
      <div className="flex justify-end pt-6 border-t border-gray-100 gap-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 text-white font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
