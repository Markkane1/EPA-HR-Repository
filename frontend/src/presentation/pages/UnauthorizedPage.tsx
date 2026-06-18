import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-8">
          <ShieldAlert className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Access Denied</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          You do not have the required permissions to view this page or perform this action.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#1e3a5f] hover:bg-blue-900 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};
