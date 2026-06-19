export const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-12">
    <div className="animate-spin inline-block w-12 h-12 border-4 border-current border-t-transparent text-[#4e73df] rounded-full" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);
