export default function WarrantyAlert({ warranty }: { warranty: any }) {
  return (
    <div className="col-span-1 bg-red-50 rounded-xl shadow p-6 border border-red-100 flex flex-col justify-center">
      <h2 className="text-xl font-semibold mb-2 text-red-700">Critical Alert</h2>
      <p className="text-sm text-red-600 font-medium mb-4">Closest Expiring Warranty</p>

      {warranty ? (
        <div>
          <p className="text-3xl font-bold text-red-700 mb-1">
            {warranty.daysLeft} days left
          </p>
          <p className="text-lg font-medium text-slate-800">{warranty.customerCompany}</p>
          <p className="text-sm text-slate-600 mt-2">Sold by: {warranty.salesmanName}</p>
        </div>
      ) : (
        <p className="text-slate-500">No active warranties found.</p>
      )}
    </div>
  );
}
