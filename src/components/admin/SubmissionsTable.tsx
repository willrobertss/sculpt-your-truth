import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Status = Database['public']['Enums']['submission_status'];

const statuses: Status[] = ['draft', 'pending', 'in_review', 'approved', 'rejected', 'live'];

const SubmissionsTable = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('submissions')
      .select('*, films(title), shorts(title)')
      .order('submitted_at', { ascending: false });
    setSubmissions(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: Status, filmId: string | null, shortId: string | null) => {
    await supabase.from('submissions').update({ status, reviewed_at: new Date().toISOString() }).eq('id', id);
    // If approved/live, also update the content status
    if (status === 'approved' || status === 'live') {
      const contentStatus = status === 'approved' ? 'approved' : 'live';
      if (filmId) await supabase.from('films').update({ status: contentStatus }).eq('id', filmId);
      if (shortId) await supabase.from('shorts').update({ status: contentStatus }).eq('id', shortId);
    }
    toast({ title: 'Status updated' });
    load();
  };

  const updateNotes = async (id: string, notes: string) => {
    await supabase.from('submissions').update({ admin_notes: notes }).eq('id', id);
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Submissions</h1>
      <div className="bg-card gold-border rounded-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Title</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Type</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Status</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Submitted</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-display text-sm text-foreground">
                  {s.films?.title || s.shorts?.title || '—'}
                </TableCell>
                <TableCell className="font-mono text-[10px] uppercase text-muted-foreground">
                  {s.film_id ? 'Film' : 'Short'}
                </TableCell>
                <TableCell>
                  <Select defaultValue={s.status} onValueChange={(v) => updateStatus(s.id, v as Status, s.film_id, s.short_id)}>
                    <SelectTrigger className="w-32 h-8 bg-surface border-border text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((st) => (
                        <SelectItem key={st} value={st} className="text-xs">{st}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">
                  {new Date(s.submitted_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Textarea
                    defaultValue={s.admin_notes || ''}
                    onBlur={(e) => updateNotes(s.id, e.target.value)}
                    placeholder="Admin notes..."
                    className="bg-surface border-border text-xs min-h-[32px] h-8 resize-none"
                  />
                </TableCell>
              </TableRow>
            ))}
            {submissions.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No submissions yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SubmissionsTable;
