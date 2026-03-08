import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ContentRowProps {
  title: string;
  children: React.ReactNode;
  viewAllLink?: string;
}

const ContentRow = ({ title, children, viewAllLink }: ContentRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">{title}</h2>
          <div className="flex items-center gap-2">
            {viewAllLink && (
              <a href={viewAllLink} className="font-mono text-[10px] uppercase tracking-widest text-primary hover:text-gold-light transition-colors mr-4">
                View All
              </a>
            )}
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full gold-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full gold-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar px-6 pb-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        <div className="w-[calc((100vw-1400px)/2)] flex-shrink-0 hidden 2xl:block" />
        {children}
      </div>
    </section>
  );
};

export default ContentRow;
