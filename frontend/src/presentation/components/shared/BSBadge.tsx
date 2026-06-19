export const BSBadge = ({ bs }: { bs: number }) => {
  let colorClass = "bg-[#36b9cc] text-white"; // info
  if (bs >= 17) colorClass = "bg-[#4e73df] text-white"; // primary
  else if (bs >= 14) colorClass = "bg-[#1cc88a] text-white"; // success
  else if (bs >= 11) colorClass = "bg-[#f6c23e] text-white"; // warning

  return (
    <span className={`inline-block py-1 px-2 rounded font-bold text-[75%] leading-none text-center whitespace-nowrap align-baseline ${colorClass}`}>
      BS-{bs}
    </span>
  );
};
