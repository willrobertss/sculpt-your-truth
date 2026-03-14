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
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="py-4 group/row relative z-0">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground">{title}</h2>
          <div className="flex items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
            {viewAllLink && (
              <a href={viewAllLink} className="font-mono text-[10px] uppercase tracking-widest text-primary hover:text-gold-light transition-colors mr-3">
                View All
              </a>
            )}
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto hide-scrollbar px-6 pb-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        <div className="w-[calc((100vw-1400px)/2)] flex-shrink-0 hidden 2xl:block" />
        {children}
      </div>
    </section>
  );
};

export default ContentRow;
