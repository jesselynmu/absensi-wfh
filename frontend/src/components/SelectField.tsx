import type { SelectHTMLAttributes } from 'react';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export function SelectField({ label, options, id, className = '', ...props }: SelectFieldProps) {
  const selectId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      <select
        id={selectId}
        className={`rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-brand-400 disabled:bg-gray-100 ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}