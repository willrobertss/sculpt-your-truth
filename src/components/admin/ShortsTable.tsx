import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Status = Database['public']['Enums']['submission_status'];
const statuses: Status[] = ['draft', 'pending', 'in_review', 'approved', 'rejected', 'live'];

const ShortsTable = () => {
  const [shorts, setShorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('shorts').select('*').order('created_at', { ascending: false });
    setShorts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateShort = async (id: string, updates: any) => {
    await supabase.from('shorts').update(updates).eq('id', id);
    toast({ title: 'Short updated' });
    load();
  };

  const deleteShort = async (id: string) => {
    if (!confirm('Delete this short?')) return;
    await supabase.from('shorts').delete().eq('id', id);
    toast({ title: 'Short deleted' });
    load();
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Shorts</h1>
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
            {shorts.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-display text-sm text-foreground">{s.title}</TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">{(s.genre || []).join(', ')}</TableCell>
                <TableCell>
                  <Select defaultValue={s.status} onValueChange={(v) => updateShort(s.id, { status: v })}>
                    <SelectTrigger className="w-28 h-8 bg-surface border-border text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((st) => <SelectItem key={st} value={st} className="text-xs">{st}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Switch checked={s.featured || false} onCheckedChange={(v) => updateShort(s.id, { featured: v })} />
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">{(s.view_count || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" className="h-7 text-destructive hover:text-destructive" onClick={() => deleteShort(s.id)}>
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {shorts.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No shorts</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ShortsTable;
