import { useMemo } from 'react';
import { AlertTriangle, BarChart3, Trophy, TrendingUp } from 'lucide-react';
import type { Issue } from '@/lib/supabase';
import { CATEGORY_META } from '@/lib/supabase';
import { timeRemaining } from '@/lib/time';

interface DashboardProps {
  issues: Issue[];
}

const WARD_COLORS: Record<string, string> = {
  'Ward 1': 'bg-amber-400',
  'Ward 2': 'bg-emerald-400',
  'Ward 3': 'bg-blue-400',
  'Ward 5': 'bg-violet-400',
};

export default function Dashboard({ issues }: DashboardProps) {
  const total = issues.length;
  const resolved = issues.filter((i) => i.status === 'resolved').length;
  const pct = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const wardStats = useMemo(() => {
    const map = new Map<string, { total: number; resolved: number; upvotes: number }>();
    for (const i of issues) {
      const w = map.get(i.ward) ?? { total: 0, resolved: 0, upvotes: 0 };
      w.total += 1;
      if (i.status === 'resolved') w.resolved += 1;
      w.upvotes += i.upvotes;
      map.set(i.ward, w);
    }
    return Array.from(map.entries())
      .map(([ward, s]) => ({ ward, ...s, rate: s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 0 }))
      .sort((a, b) => b.resolved - a.resolved || b.upvotes - a.upvotes);
  }, [issues]);

  const breaches = useMemo(
    () =>
      issues.filter((i) => {
        if (i.status === 'resolved') return false;
        const sla = timeRemaining(i.sla_deadline);
        return sla.breached;
      }),
    [issues],
  );

  const maxWardTotal = Math.max(...wardStats.map((w) => w.total), 1);

  return (
    <div className="space-y-4">
      {/* Progress overview */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-gray-900 text-sm">Resolution Progress</h3>
        </div>

        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-3xl font-bold text-gray-900">{pct}<span className="text-lg text-gray-400">%</span></p>
            <p className="text-xs text-gray-500">{resolved} of {total} issues resolved</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-blue-600 flex items-center gap-1 justify-end">
              <TrendingUp className="w-3.5 h-3.5" />
              {total - resolved} active
            </p>
          </div>
        </div>

        <div className="h-3 rounded-full bg-gray-100 overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 flex items-center justify-end"
            style={{ width: `${pct}%` }}
          />
          <div
            className="bg-amber-400 transition-all duration-500"
            style={{ width: `${Math.round((issues.filter(i => i.status === 'in_progress').length / Math.max(total,1)) * 100)}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> Resolved</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> In progress</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-gray-200" /> Pending</span>
        </div>
      </div>

      {/* Ward leaderboard */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-gray-900 text-sm">Ward Leaderboard</h3>
        </div>

        <div className="space-y-3">
          {wardStats.map((w, idx) => (
            <div key={w.ward}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                  }`}>{idx + 1}</span>
                  <span className="font-semibold text-gray-700">{w.ward}</span>
                </span>
                <span className="text-gray-500">{w.resolved}/{w.total} resolved · {w.upvotes} votes</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${WARD_COLORS[w.ward] ?? 'bg-gray-400'}`}
                  style={{ width: `${(w.total / maxWardTotal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SLA breaches */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <h3 className="font-bold text-gray-900 text-sm">SLA Breaches & Escalations</h3>
          <span className="ml-auto text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            {breaches.length} flagged
          </span>
        </div>

        {breaches.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No SLA breaches — all active issues within deadline.</p>
        ) : (
          <div className="space-y-2.5">
            {breaches.map((b) => {
              const sla = timeRemaining(b.sla_deadline);
              const cat = CATEGORY_META[b.category];
              return (
                <div
                  key={b.id}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 flex items-start gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{b.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {cat.label} · {b.ward} · SLA {sla.label}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full whitespace-nowrap shrink-0">
                    Escalated to Ward Officer
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
