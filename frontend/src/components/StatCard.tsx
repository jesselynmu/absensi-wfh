import type { LucideIcon } from 'lucide-react';

const tones = {
  brand: 'bg-brand-50 text-brand-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-600',
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  hint?: string;
}

export function StatCard({ label, value, icon: Icon, tone = 'slate', hint }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}