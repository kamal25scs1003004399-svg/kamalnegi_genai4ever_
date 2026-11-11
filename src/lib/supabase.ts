import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type IssueCategory = 'roads' | 'garbage' | 'streetlights' | 'water';
export type IssueUrgency = 'low' | 'medium' | 'high';
export type IssueStatus = 'pending' | 'in_progress' | 'resolved';

export interface Issue {
  id: string;
  title: string;
  category: IssueCategory;
  location: string;
  description: string | null;
  urgency: IssueUrgency;
  status: IssueStatus;
  image_url: string | null;
  upvotes: number;
  ward: string;
  sla_deadline: string;
  resolved_at: string | null;
  created_at: string;
}

export const CATEGORY_META: Record<
  IssueCategory,
  { label: string; badgeClass: string; iconClass: string }
> = {
  roads: {
    label: 'Roads / Potholes',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    iconClass: 'text-blue-600',
  },
  garbage: {
    label: 'Garbage / Sanitation',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
    iconClass: 'text-amber-600',
  },
  streetlights: {
    label: 'Streetlights',
    badgeClass: 'bg-violet-100 text-violet-700 border-violet-200',
    iconClass: 'text-violet-600',
  },
  water: {
    label: 'Water Leakage',
    badgeClass: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    iconClass: 'text-cyan-600',
  },
};

export const URGENCY_META: Record<
  IssueUrgency,
  { label: string; badgeClass: string }
> = {
  low: { label: 'Low', badgeClass: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', badgeClass: 'bg-orange-100 text-orange-700' },
  high: { label: 'High', badgeClass: 'bg-red-100 text-red-700' },
};

export const STATUS_META: Record<
  IssueStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  pending: {
    label: 'Pending',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  in_progress: {
    label: 'In Progress - Priority Queue',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
  },
  resolved: {
    label: 'Resolved',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
};
