import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const TestimonialsManager = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', quote: '', avatar_url: '', rating: 5 });
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('testimonials').select('*').order('display_order');
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addTestimonial = async () => {
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.display_order)) + 1 : 0;
    await supabase.from('testimonials').insert({
      ...form,
      display_order: maxOrder,
      avatar_url: form.avatar_url || null,
    });
    setForm({ name: '', role: '', quote: '', avatar_url: '', rating: 5 });
    setDialogOpen(false);
    toast({ title: 'Testimonial added' });
    load();
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from('testimonials').update({ is_active: active }).eq('id', id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    toast({ title: 'Deleted' });
    load();
  };

  const reorder = async (id: string, dir: 'up' | 'down') => {
    const idx = items.findIndex(i => i.id === id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const a = items[idx], b = items[swapIdx];
    await Promise.all([
      supabase.from('testimonials').update({ display_order: b.display_order }).eq('id', a.id),
      supabase.from('testimonials').update({ display_order: a.display_order }).eq('id', b.id),
    ]);
    load();
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Testimonials</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground text-xs"><Plus size={14} className="mr-1" /> Add</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-display">New Testimonial</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-surface border-border" /></div>
              <div><Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Role</Label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="bg-surface border-border" /></div>
              <div><Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Quote</Label>
                <Textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className="bg-surface border-border" /></div>
              <div><Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Avatar URL</Label>
                <Input value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} className="bg-surface border-border" placeholder="Optional" /></div>
              <Button onClick={addTestimonial} disabled={!form.name || !form.quote} className="w-full bg-primary text-primary-foreground">Add Testimonial</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg-card gold-border rounded-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Order</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Name</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Quote</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Active</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((t, i) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => reorder(t.id, 'up')} disabled={i === 0}><ArrowUp size={12} /></Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => reorder(t.id, 'down')} disabled={i === items.length - 1}><ArrowDown size={12} /></Button>
                  </div>
                </TableCell>
                <TableCell className="font-display text-sm text-foreground">{t.name}<br /><span className="font-mono text-[10px] text-muted-foreground">{t.role}</span></TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{t.quote}</TableCell>
                <TableCell><Switch checked={t.is_active} onCheckedChange={(v) => toggle(t.id, v)} /></TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={() => remove(t.id)}><Trash2 size={14} /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TestimonialsManager;
