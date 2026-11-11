import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, LayoutDashboard, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import ReportForm from '@/components/ReportForm';
import CommunityFeed from '@/components/CommunityFeed';
import Dashboard from '@/components/Dashboard';
import { supabase, type Issue } from '@/lib/supabase';

type Tab = 'feed' | 'dashboard';

export default function App() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('feed');
  const [upvotingId, setUpvotingId] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setLoading(false);
      return;
    }
    setIssues(data as Issue[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleUpvote = useCallback(
    async (id: string) => {
      // Optimistic update
      setIssues((prev) =>
        prev
          .map((i) => (i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i))
          .sort((a, b) => b.upvotes - a.upvotes),
      );
      setUpvotingId(id);
      const issue = issues.find((i) => i.id === id);
      const newCount = (issue?.upvotes ?? 0) + 1;
      await supabase.from('issues').update({ upvotes: newCount }).eq('id', id);
      setUpvotingId(null);
    },
    [issues],
  );

  const stats = {
    total: issues.length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
    avgResponseHours: (() => {
      const resolvedIssues = issues.filter((i) => i.status === 'resolved' && i.resolved_at);
      if (resolvedIssues.length === 0) return null;
      const avg =
        resolvedIssues.reduce((sum, i) => {
          const diff = new Date(i.resolved_at!).getTime() - new Date(i.created_at).getTime();
          return sum + diff / (1000 * 60 * 60);
        }, 0) / resolvedIssues.length;
      return Math.round(avg);
    })(),
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header stats={stats} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        {/* Tab switch */}
        <div className="flex items-center gap-1 mb-5 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
          <TabButton
            active={tab === 'feed'}
            onClick={() => setTab('feed')}
            icon={<ClipboardList className="w-4 h-4" />}
            label="Community Feed"
          />
          <TabButton
            active={tab === 'dashboard'}
            onClick={() => setTab('dashboard')}
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Authority Dashboard"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin mb-3" />
            <p className="text-sm">Loading civic reports…</p>
          </div>
        ) : tab === 'feed' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1 lg:sticky lg:top-28 lg:self-start">
              <ReportForm onSubmitted={fetchIssues} />
            </div>
            <div className="lg:col-span-2">
              <CommunityFeed issues={issues} onUpvote={handleUpvote} upvotingId={upvotingId} />
            </div>
          </div>
        ) : (
          <Dashboard issues={issues} />
        )}
      </div>

      <footer className="border-t border-gray-200 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-center text-xs text-gray-400">
          CivicPulse · Empowering citizens, accountable cities.
        </div>
      </footer>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
        active ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
