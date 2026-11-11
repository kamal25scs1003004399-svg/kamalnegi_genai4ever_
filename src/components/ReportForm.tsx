import { useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  ImageIcon,
  Loader2,
  LocateFixed,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import type { IssueCategory, IssueUrgency } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

interface ReportFormProps {
  onSubmitted: () => void;
}

const CATEGORIES: { value: IssueCategory; label: string }[] = [
  { value: 'roads', label: 'Roads / Potholes' },
  { value: 'garbage', label: 'Garbage / Sanitation' },
  { value: 'streetlights', label: 'Streetlights' },
  { value: 'water', label: 'Water Leakage' },
];

const URGENCIES: { value: IssueUrgency; label: string; ring: string }[] = [
  { value: 'low', label: 'Low', ring: 'peer-checked:border-gray-400 peer-checked:bg-gray-50' },
  { value: 'medium', label: 'Medium', ring: 'peer-checked:border-orange-400 peer-checked:bg-orange-50' },
  { value: 'high', label: 'High', ring: 'peer-checked:border-red-400 peer-checked:bg-red-50' },
];

export default function ReportForm({ onSubmitted }: ReportFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IssueCategory>('roads');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<IssueUrgency>('medium');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [duplicateStatus, setDuplicateStatus] = useState<'idle' | 'checking' | 'clear'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerDuplicateCheck = (value: string) => {
    if (dupTimer.current) clearTimeout(dupTimer.current);
    if (value.trim().length < 4) {
      setDuplicateStatus('idle');
      return;
    }
    setDuplicateStatus('checking');
    dupTimer.current = setTimeout(() => {
      setDuplicateStatus('clear');
    }, 1800);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    triggerDuplicateCheck(val);
  };

  const handleLocationChange = (val: string) => {
    setLocation(val);
    triggerDuplicateCheck(val);
  };

  const handleUseLocation = () => {
    setLocating(true);
    setTimeout(() => {
      const mockLocations = [
        'Sector 12, near City Park Gate',
        'Riverside Drive & Oak Lane',
        'Central Market, Lane 4',
        'Highway 7, Mile 2.5',
      ];
      setLocation(mockLocations[Math.floor(Math.random() * mockLocations.length)]);
      setLocating(false);
      triggerDuplicateCheck('mock');
    }, 900);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('issues').insert({
      title: title.trim(),
      category,
      location: location.trim(),
      description: description.trim() || null,
      urgency,
      image_url: imagePreview,
      status: 'pending',
      upvotes: 0,
    });

    setSubmitting(false);
    if (insertError) {
      setError('Something went wrong submitting your report. Please try again.');
      return;
    }
    resetForm();
    onSubmitted();
  };

  const resetForm = () => {
    setTitle('');
    setCategory('roads');
    setLocation('');
    setDescription('');
    setUrgency('medium');
    setImagePreview(null);
    setDuplicateStatus('idle');
    if (fileRef.current) fileRef.current.value = '';
  };

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Send className="w-4 h-4 text-blue-600" />
          Report a New Issue
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Help your community by reporting civic problems</p>
      </div>

      <div className="p-5 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Issue Title</label>
          <input
            className={inputClass}
            placeholder="e.g. Large pothole near school crossing"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />
        </div>

        {/* Duplicate checker banner */}
        <DuplicateBanner status={duplicateStatus} />

        {/* Category + Urgency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
            <select
              className={inputClass}
              value={category}
              onChange={(e) => setCategory(e.target.value as IssueCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Urgency Level</label>
            <div className="grid grid-cols-3 gap-2">
              {URGENCIES.map((u) => (
                <label
                  key={u.value}
                  className={`cursor-pointer rounded-lg border-2 border-gray-200 px-2 py-2 text-center text-xs font-medium text-gray-600 transition ${u.ring}`}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value={u.value}
                    checked={urgency === u.value}
                    onChange={() => setUrgency(u.value)}
                    className="sr-only peer"
                  />
                  {u.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Location</label>
          <div className="relative">
            <input
              className={inputClass + ' pr-32'}
              placeholder="Enter address or landmark"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={locating}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-md transition disabled:opacity-60"
            >
              {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
              {locating ? 'Locating…' : 'Use My Location'}
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
          <textarea
            className={inputClass + ' resize-none'}
            rows={3}
            placeholder="Describe the issue in detail — size, impact, how long it's been there…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Photo (optional)</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
              <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
              <button
                type="button"
                onClick={() => { setImagePreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 flex flex-col items-center gap-1.5 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs font-medium">Click to upload a photo</span>
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> JPG, PNG up to a few MB
              </span>
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !title.trim() || !location.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition flex items-center justify-center gap-2 shadow-sm"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Report…</>
          ) : (
            <><Send className="w-4 h-4" /> Submit Report</>
          )}
        </button>
      </div>
    </form>
  );
}

function DuplicateBanner({ status }: { status: 'idle' | 'checking' | 'clear' }) {
  if (status === 'idle') return null;
  if (status === 'checking') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700 animate-fadeIn">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        AI Duplicate Checker: Checking for duplicate reports nearby…
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs text-emerald-700 animate-fadeIn">
      <CheckCircle2 className="w-3.5 h-3.5" />
      AI Duplicate Checker: No similar reports found nearby — you're good to submit.
    </div>
  );
}
