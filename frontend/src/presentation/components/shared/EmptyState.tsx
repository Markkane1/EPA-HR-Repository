import { AlertCircle } from 'lucide-react';

export const EmptyState = ({ message = "No data available" }: { message?: string }) => (
  <div className="text-center p-12 text-gray-500">
    <AlertCircle className="mb-2 text-gray-400 mx-auto w-12 h-12" />
    <p className="text-xl font-light leading-relaxed">{message}</p>
  </div>
);
