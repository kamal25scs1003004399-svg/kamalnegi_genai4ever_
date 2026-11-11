import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Loader2, Inbox } from 'lucide-react';
import type { Issue, IssueCategory, IssueStatus } from '@/lib/supabase';
import IssueCard from './IssueCard';

interface CommunityFeedProps {
  issues: Issue[];
  onUpvote: (id: string) => Promise<void>;
  upvotingId: string | null;
}

type StatusFilter = 'all' | IssueStatus;
type CategoryFilter = 'all' | IssueCategory;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'roads', label: 'Roads / Potholes' },
  { value: 'garbage', label: 'Garbage / Sanitation' },
  { value: 'streetlights', label: 'Streetlights' },
  { value: 'water', label: 'Water Leakage' },
];

export default function CommunityFeed({ issues, onUpvote, upvotingId }: CommunityFeedProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const filtered = useMemo(() => {
    let list = [...issues];
    if (statusFilter !== 'all') list = list.filter((i) => i.status === statusFilter);
    if (categoryFilter !== 'all') list = list.filter((i) => i.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => b.upvotes - a.upvotes);
    return list;
  }, [issues, statusFilter, categoryFilter, search]);

  return (
    <div>
      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              placeholder="Search by title or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              className="rounded-lg border border-gray-300 pl-9 pr-8 py-2 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition appearance-none cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            >
              {CATEGORY_FILTERS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition ${
                statusFilter === s.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">
          <Inbox className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">No issues match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400 px-1">
            {filtered.length} issue{filtered.length !== 1 ? 's' : ''} · sorted by most upvoted
          </p>
          {filtered.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onUpvote={onUpvote}
              upvoting={upvotingId === issue.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
