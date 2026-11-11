import { useMemo } from 'react';
import { ArrowUp, ImageIcon, MapPin, AlertTriangle, Clock } from 'lucide-react';
import type { Issue } from '@/lib/supabase';
import { CATEGORY_META, STATUS_META, URGENCY_META } from '@/lib/supabase';
import { timeRemaining, relativeTime } from '@/lib/time';

interface IssueCardProps {
  issue: Issue;
  onUpvote: (id: string) => void;
  upvoting: boolean;
}

export default function IssueCard({ issue, onUpvote, upvoting }: IssueCardProps) {
  const cat = CATEGORY_META[issue.category];
  const status = STATUS_META[issue.status];
  const urgency = URGENCY_META[issue.urgency];
  const sla = useMemo(() => timeRemaining(issue.sla_deadline), [issue.sla_deadline]);
  const slaBreached = sla.breached && issue.status !== 'resolved';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-40 sm:shrink-0 h-32 sm:h-auto bg-gray-100 relative">
          {issue.image_url ? (
            <img src={issue.image_url} alt={issue.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ImageIcon className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cat.badgeClass}`}>
                {cat.label}
              </span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${urgency.badgeClass}`}>
                {urgency.label} urgency
              </span>
            </div>
            <span className="text-[11px] text-gray-400">{relativeTime(issue.created_at)}</span>
          </div>

          <h3 className="font-semibold text-gray-900 text-sm mt-2 leading-snug">{issue.title}</h3>

          <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {issue.location}
          </p>

          {issue.description && (
            <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">{issue.description}</p>
          )}

          <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
            {/* Status + SLA */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full border ${status.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                {status.label}
              </span>

              {issue.status !== 'resolved' && (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full border ${
                    slaBreached
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  {slaBreached ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  SLA: {sla.label}
                </span>
              )}

              {slaBreached && (
                <span className="text-[11px] font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full animate-pulse">
                  Escalated to Ward Officer
                </span>
              )}
            </div>

            {/* Upvote */}
            <button
              onClick={() => onUpvote(issue.id)}
              disabled={upvoting}
              className="group flex items-center gap-1.5 rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 px-3 py-1.5 transition disabled:opacity-50"
            >
              <ArrowUp className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-gray-900 tabular-nums">{issue.upvotes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
