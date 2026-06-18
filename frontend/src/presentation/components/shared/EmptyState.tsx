import { AlertCircle } from 'lucide-react';

export const EmptyState = ({ message = "No data available" }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center p-8 text-gray-500">
    <AlertCircle className="w-12 h-12 mb-2 text-gray-400" />
    <p>{message}</p>
  </div>
);
