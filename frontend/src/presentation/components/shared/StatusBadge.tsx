export const StatusBadge = ({ status }: { status: string }) => {
  const normStatus = status.toLowerCase();
  let bg = 'bg-[#858796] text-white'; // secondary
  
  if (normStatus === 'active' || normStatus === 'occupied') bg = 'bg-[#1cc88a] text-white'; // success
  if (normStatus === 'retired' || normStatus === 'vacant') bg = 'bg-[#858796] text-white'; // secondary
  if (normStatus === 'transferred') bg = 'bg-[#f6c23e] text-white'; // warning
  if (normStatus === 'on attachment' || normStatus === 'attached') bg = 'bg-[#36b9cc] text-white'; // info

  return (
    <span className={`inline-block py-1 px-3 rounded-full font-bold text-[75%] leading-none text-center whitespace-nowrap align-baseline ${bg}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
