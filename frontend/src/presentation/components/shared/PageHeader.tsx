export const PageHeader = ({ title, breadcrumb, actionButton }: { title: string, breadcrumb?: string, actionButton?: React.ReactNode }) => (
  <div className="flex justify-between items-center mb-6">
    <div>
      {breadcrumb && <p className="text-sm font-medium text-blue-600 mb-1">{breadcrumb}</p>}
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
    </div>
    <div>{actionButton}</div>
  </div>
);
