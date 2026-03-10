import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AdminDialog from './AdminDialog';

interface Genre {
  id: string;
  name: string;
  priority: number;
  sub_count: number;
}

const SortableGenreRow = ({ genre }: { genre: Genre }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: genre.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg mb-2">
      <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
        <GripVertical size={18} />
      </button>
      <span className="font-heading text-sm uppercase tracking-wide text-black flex-1">{genre.name}</span>
      <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-sans text-xs">{genre.sub_count} sub-genres</Badge>
    </div>
  );
};

const GenresManager = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [activeTab, setActiveTab] = useState<'genres' | 'filmmakers' | 'types'>('genres');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchGenres = useCallback(async () => {
    setLoading(true);
    const { data: genresData } = await supabase.from('genres').select('*').order('priority', { ascending: true });
    if (!genresData) { setLoading(false); return; }

    const { data: subCounts } = await supabase.from('sub_genres').select('genre_id');
    const countMap: Record<string, number> = {};
    (subCounts || []).forEach((s: any) => { countMap[s.genre_id] = (countMap[s.genre_id] || 0) + 1; });

    setGenres(genresData.map((g: any) => ({ ...g, sub_count: countMap[g.id] || 0 })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchGenres(); }, [fetchGenres]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = genres.findIndex((g) => g.id === active.id);
    const newIndex = genres.findIndex((g) => g.id === over.id);
    const reordered = arrayMove(genres, oldIndex, newIndex);
    setGenres(reordered);

    // Batch update priorities
    for (let i = 0; i < reordered.length; i++) {
      await supabase.from('genres').update({ priority: i }).eq('id', reordered[i].id);
    }
    toast.success('Order updated');
  };

  const handleAddGenre = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from('genres').insert({ name: newName.trim(), priority: genres.length });
    if (error) { toast.error('Failed to add genre'); return; }
    toast.success('Genre added');
    setNewName('');
    setAddOpen(false);
    fetchGenres();
  };

  const tabs = ['genres', 'filmmakers', 'types'] as const;

  return (
    <div>
      <h2 className="font-heading text-2xl uppercase tracking-wide text-black mb-4">Settings</h2>

      {/* Sub tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-heading text-xs uppercase tracking-widest border-b-2 transition-colors ${
              activeTab === tab ? 'border-[hsl(356,80%,42%)] text-[hsl(356,80%,42%)]' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'genres' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="font-sans text-sm text-gray-500">Drag to reorder. Priority is saved automatically.</p>
            <Button onClick={() => setAddOpen(true)} className="bg-[hsl(356,80%,42%)] hover:bg-[hsl(356,80%,35%)] text-white font-heading uppercase tracking-wider text-xs">
              <Plus size={14} className="mr-1" /> Add Genre
            </Button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={genres.map((g) => g.id)} strategy={verticalListSortingStrategy}>
                {genres.map((genre) => (
                  <SortableGenreRow key={genre.id} genre={genre} />
                ))}
              </SortableContext>
            </DndContext>
          )}

          <AdminDialog open={addOpen} onOpenChange={setAddOpen} title="Add Genre">
            <Input
              placeholder="Genre name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-white border-gray-300 text-black font-sans"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="font-heading uppercase tracking-wider">Cancel</Button>
              <Button onClick={handleAddGenre} className="bg-[hsl(356,80%,42%)] text-white font-heading uppercase tracking-wider">Add</Button>
            </div>
          </AdminDialog>
        </div>
      )}

      {activeTab === 'filmmakers' && (
        <div className="text-center py-12">
          <p className="font-sans text-gray-400 text-sm">Filmmakers management coming soon.</p>
        </div>
      )}

      {activeTab === 'types' && (
        <div className="text-center py-12">
          <p className="font-sans text-gray-400 text-sm">Types management coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default GenresManager;
