import type { ReactNode } from 'react';

const tones = {
  green: 'bg-green-50 text-green-700 ring-green-600/20',
  gray: 'bg-gray-100 text-gray-600 ring-gray-500/20',
  brand: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
};

interface BadgeProps {
  tone?: keyof typeof tones;
  children: ReactNode;
}

export function Badge({ tone = 'gray', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}>
      {children}
    </span>
  );
}