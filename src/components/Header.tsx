import { Activity, CheckCircle2, Clock, Gauge } from 'lucide-react';

interface HeaderStats {
  total: number;
  resolved: number;
  avgResponseHours: number | null;
}

interface HeaderProps {
  stats: HeaderStats;
}

export default function Header({ stats }: HeaderProps) {
  const pct = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
              <Gauge className="w-6 h-6 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Civic<span className="text-blue-600">Pulse</span>
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">Smart Civic Issue Reporting System</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <StatCard
              icon={<Activity className="w-4 h-4" />}
              label="Total Issues"
              value={stats.total.toString()}
              accent="text-blue-600"
              bg="bg-blue-50"
            />
            <StatCard
              icon={<CheckCircle2 className="w-4 h-4" />}
              label="Resolved"
              value={stats.resolved.toString()}
              sub={`${pct}% rate`}
              accent="text-emerald-600"
              bg="bg-emerald-50"
            />
            <StatCard
              icon={<Clock className="w-4 h-4" />}
              label="Avg Response"
              value={stats.avgResponseHours !== null ? `${stats.avgResponseHours}h` : '—'}
              accent="text-amber-600"
              bg="bg-amber-50"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: string;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-gray-200 px-2.5 py-2 sm:px-3 sm:py-2.5">
      <div className={`w-8 h-8 rounded-lg ${bg} ${accent} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-gray-500 leading-none whitespace-nowrap">{label}</p>
        <p className="text-sm sm:text-base font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-gray-400 leading-none">{sub}</p>}
      </div>
    </div>
  );
}
