import { Star } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface TestimonialCardProps {
  name: string;
  role: string;
  quote: string;
  avatarUrl?: string | null;
  rating: number;
}

const TestimonialCard = ({ name, role, quote, avatarUrl, rating }: TestimonialCardProps) => {
  return (
    <div className="bg-card gold-border rounded-sm p-5 flex flex-col gap-3 min-w-[260px] max-w-[300px] flex-shrink-0">
      <div className="flex gap-0.5">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={14} className="fill-primary text-primary" />
        ))}
      </div>
      <p className="font-body text-sm text-muted-foreground leading-relaxed italic">
        "{quote}"
      </p>
      <div className="flex items-center gap-3 mt-auto pt-2">
        <Avatar className="h-9 w-9">
          <AvatarImage src={avatarUrl ?? undefined} alt={name} />
          <AvatarFallback className="bg-muted text-xs font-mono">
            {name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-display text-sm font-semibold text-foreground leading-tight">{name}</p>
          <p className="font-mono text-[9px] uppercase tracking-wider text-primary">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
