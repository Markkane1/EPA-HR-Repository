import { Link } from 'react-router-dom';

export const UnauthorizedPage = () => {
  return (
    <div className="w-full px-5 pb-5">
      <div className="text-center mt-12">
        <div className="text-[7rem] relative leading-none font-black text-[#5a5c69]" data-text="403">403</div>
        <p className="text-xl font-light text-gray-800 mb-12">Access Denied</p>
        <p className="text-gray-500 mb-0">You do not have the required permissions to view this page or perform this action.</p>
        <Link to="/" className="mt-4 inline-block text-[#4e73df] hover:text-[#2e59d9] hover:underline transition-colors">&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
};
