import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {props.required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={[
          'w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all duration-150 bg-white dark:bg-slate-800',
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
            : 'border-slate-200 dark:border-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900',
          'placeholder:text-slate-400 text-slate-900 dark:text-slate-100',
          className,
        ].join(' ')}
      />
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, className = '', ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        {...props}
        className={[
          'w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all duration-150 resize-none bg-white dark:bg-slate-800',
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
            : 'border-slate-200 dark:border-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-100',
          'placeholder:text-slate-400 text-slate-900 dark:text-slate-100',
          className,
        ].join(' ')}
      />
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
    </div>
  );
}
