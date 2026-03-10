import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DateRangeFilterProps {
  onApply: (from: string, to: string) => void;
}

const DateRangeFilter = ({ onApply }: DateRangeFilterProps) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  return (
    <div className="flex items-end gap-3 flex-wrap">
      <div>
        <label className="block text-xs font-heading uppercase tracking-wider text-gray-500 mb-1">From</label>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-white border-gray-300 text-black w-40" />
      </div>
      <div>
        <label className="block text-xs font-heading uppercase tracking-wider text-gray-500 mb-1">To</label>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-white border-gray-300 text-black w-40" />
      </div>
      <Button
        onClick={() => onApply(from, to)}
        className="bg-[hsl(356,80%,42%)] hover:bg-[hsl(356,80%,35%)] text-white font-heading uppercase tracking-wider"
      >
        Apply
      </Button>
    </div>
  );
};

export default DateRangeFilter;
