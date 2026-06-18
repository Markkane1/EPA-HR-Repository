export const StatusBadge = ({ status }: { status: string }) => {
  const normStatus = status.toLowerCase();
  let bg = 'bg-gray-100 text-gray-800';
  
  if (normStatus === 'active' || normStatus === 'occupied') bg = 'bg-green-100 text-green-800';
  if (normStatus === 'retired' || normStatus === 'vacant') bg = 'bg-gray-200 text-gray-600';
  if (normStatus === 'transferred') bg = 'bg-yellow-100 text-yellow-800';
  if (normStatus === 'on attachment' || normStatus === 'attached') bg = 'bg-blue-100 text-blue-800';

  return (
    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${bg}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
