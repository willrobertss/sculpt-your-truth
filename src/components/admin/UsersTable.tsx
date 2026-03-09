import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];
const roles: AppRole[] = ['admin', 'creator', 'viewer'];

const UsersTable = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, AppRole[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const [p, r] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('*'),
    ]);
    setProfiles(p.data || []);
    const roleMap: Record<string, AppRole[]> = {};
    (r.data || []).forEach((ur: any) => {
      if (!roleMap[ur.user_id]) roleMap[ur.user_id] = [];
      roleMap[ur.user_id].push(ur.role);
    });
    setUserRoles(roleMap);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addRole = async (userId: string, role: AppRole) => {
    if (userRoles[userId]?.includes(role)) return;
    await supabase.from('user_roles').insert({ user_id: userId, role });
    toast({ title: `Role "${role}" added` });
    load();
  };

  const removeRole = async (userId: string, role: AppRole) => {
    await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', role);
    toast({ title: `Role "${role}" removed` });
    load();
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Users & Creators</h1>
      <div className="bg-card gold-border rounded-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Name</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Slug</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Roles</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Add Role</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-display text-sm text-foreground">{p.display_name || '—'}</TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">{p.slug || '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {(userRoles[p.user_id] || []).map((r) => (
                      <Badge key={r} variant="outline" className="text-[10px] gold-border text-primary cursor-pointer hover:bg-destructive/20 hover:text-destructive hover:border-destructive" onClick={() => removeRole(p.user_id, r)}>
                        {r} ×
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Select onValueChange={(v) => addRole(p.user_id, v as AppRole)}>
                    <SelectTrigger className="w-28 h-8 bg-surface border-border text-xs">
                      <SelectValue placeholder="Add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.filter(r => !(userRoles[p.user_id] || []).includes(r)).map((r) => (
                        <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsersTable;
