interface EmptyStateProps {
  message?: string;
  subMessage?: string;
}

export const EmptyState = ({ message = "No data found", subMessage }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] text-center h-full min-h-[300px]">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <i className="fas fa-exclamation-triangle text-[#e74a3b] text-2xl"></i>
      </div>
      <h3 className="text-lg font-bold text-[#5a5c69] mb-1">{message}</h3>
      {subMessage && <p className="text-[#858796]">{subMessage}</p>}
    </div>
  );
};
