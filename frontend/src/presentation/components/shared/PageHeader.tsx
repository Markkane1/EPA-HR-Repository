export const PageHeader = ({ title, breadcrumb, actionButton }: { title: string, breadcrumb?: string, actionButton?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
    <div>
      {breadcrumb && <p className="text-sm font-bold text-primary mb-1">{breadcrumb}</p>}
      <h1 className="text-3xl text-[#5a5c69] m-0">{title}</h1>
    </div>
    <div className="mt-4 sm:mt-0">{actionButton}</div>
  </div>
);
