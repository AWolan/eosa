export default function Header({ status }: { status: 'connected' | 'reconnecting' | 'disconnected' }) {
  const statusConfig = {
    connected: { color: 'bg-green-500', text: 'Live' },
    reconnecting: { color: 'bg-yellow-500', text: 'Reconnecting...' },
    disconnected: { color: 'bg-red-500', text: 'Disconnected' },
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Engine Oil Sales Dashboard</h1>
      <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-slate-200">
        <span className={`w-3 h-3 rounded-full ${statusConfig[status].color} animate-pulse`}></span>
        <span className="text-sm font-medium text-slate-600">{statusConfig[status].text}</span>
      </div>
    </div>
  );
}
