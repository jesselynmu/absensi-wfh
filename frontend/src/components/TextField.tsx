import type { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, id, className = '', ...props }: TextFieldProps) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        id={inputId}
        className={`rounded-lg border px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-brand-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${
          error ? 'border-red-600' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}