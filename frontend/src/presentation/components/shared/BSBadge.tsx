export const BSBadge = ({ bs }: { bs: number }) => {
  let colorClass = "bg-blue-100 text-blue-800";
  if (bs >= 17) colorClass = "bg-blue-900 text-white";
  else if (bs >= 14) colorClass = "bg-blue-600 text-white";
  else if (bs >= 11) colorClass = "bg-blue-400 text-blue-900";

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${colorClass}`}>
      BS-{bs}
    </span>
  );
};
