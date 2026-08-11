export default function Leaderboard({ data }: { data: any[] }) {
  if (data.length === 0) {
    return (
      <div className="col-span-2 bg-white rounded-xl shadow p-6 flex items-center justify-center">
        <p className="text-slate-500">Waiting for data...</p>
      </div>
    );
  }

  return (
    <div className="col-span-2 bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Sales Leaderboard</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
          <tr className="border-b">
            <th className="py-2">Rank</th>
            <th className="py-2">Salesman</th>
            <th className="py-2">Total Volume (Litres)</th>
          </tr>
          </thead>
          <tbody>
          {data.map((row, index) => (
            <tr key={row.name} className="border-b last:border-0 hover:bg-slate-50">
              <td className="py-3 font-medium">#{index + 1}</td>
              <td className="py-3">{row.name}</td>
              <td className="py-3 font-mono">{row.total.toFixed(2)} L</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
