import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Database } from '@/integrations/supabase/types';

type Status = Database['public']['Enums']['submission_status'];
const statuses: Status[] = ['draft', 'pending', 'in_review', 'approved', 'rejected', 'live'];

const FilmsTable = () => {
  const [films, setFilms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('films').select('*').order('created_at', { ascending: false });
    setFilms(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateFilm = async (id: string, updates: any) => {
    await supabase.from('films').update(updates).eq('id', id);
    toast({ title: 'Film updated' });
    load();
  };

  const deleteFilm = async (id: string) => {
    if (!confirm('Delete this film?')) return;
    await supabase.from('films').delete().eq('id', id);
    toast({ title: 'Film deleted' });
    load();
  };

  const saveEdit = async () => {
    if (!editing) return;
    await updateFilm(editing.id, {
      title: editing.title,
      synopsis: editing.synopsis,
      genre: editing.genre,
      status: editing.status,
      featured: editing.featured,
    });
    setEditing(null);
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Films</h1>
      <div className="bg-card gold-border rounded-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Title</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Genre</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Status</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Featured</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Views</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {films.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-display text-sm text-foreground">{f.title}</TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">{(f.genre || []).join(', ')}</TableCell>
                <TableCell>
                  <Select defaultValue={f.status} onValueChange={(v) => updateFilm(f.id, { status: v })}>
                    <SelectTrigger className="w-28 h-8 bg-surface border-border text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((st) => <SelectItem key={st} value={st} className="text-xs">{st}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Switch checked={f.featured || false} onCheckedChange={(v) => updateFilm(f.id, { featured: v })} />
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">{(f.view_count || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-7 text-xs gold-border" onClick={() => setEditing({ ...f })}>Edit</Button>
                      </DialogTrigger>
                      {editing && editing.id === f.id && (
                        <DialogContent className="bg-card border-border">
                          <DialogHeader><DialogTitle className="font-display">Edit Film</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <div><Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Title</Label>
                              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="bg-surface border-border" /></div>
                            <div><Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Synopsis</Label>
                              <Textarea value={editing.synopsis || ''} onChange={(e) => setEditing({ ...editing, synopsis: e.target.value })} className="bg-surface border-border" /></div>
                            <div><Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Genre (comma separated)</Label>
                              <Input value={(editing.genre || []).join(', ')} onChange={(e) => setEditing({ ...editing, genre: e.target.value.split(',').map((g: string) => g.trim()) })} className="bg-surface border-border" /></div>
                            <Button onClick={saveEdit} className="w-full bg-primary text-primary-foreground">Save Changes</Button>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                    <Button size="sm" variant="ghost" className="h-7 text-destructive hover:text-destructive" onClick={() => deleteFilm(f.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {films.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No films</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FilmsTable;
