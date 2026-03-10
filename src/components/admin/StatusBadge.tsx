import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  approved: boolean;
  label?: string;
  className?: string;
}

const StatusBadge = ({ approved, label, className }: StatusBadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-heading uppercase tracking-wider',
      approved
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800',
      className
    )}
  >
    {approved ? <Check size={12} /> : <X size={12} />}
    {label ?? (approved ? 'Approved' : 'Reproved')}
  </span>
);

export default StatusBadge;
