interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-orange-500',
];

function getColorIndex(name: string): number {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % COLORS.length;
  return Math.abs(hash);
}

const sizeClasses = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-sm',
};

export function Avatar({ name, size = 'sm', className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const color = COLORS[getColorIndex(name)];

  return (
    <div
      title={name}
      className={[
        'rounded-full flex items-center justify-center text-white font-semibold shrink-0',
        color,
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {initials}
    </div>
  );
}
