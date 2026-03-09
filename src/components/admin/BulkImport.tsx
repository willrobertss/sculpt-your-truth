import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const DB_FIELDS = [
  'title', 'synopsis', 'tagline', 'genre', 'release_year',
  'duration_minutes', 'poster_url', 'video_url', 'trailer_url',
  'banner_url', 'tags', 'slug', 'content_type',
] as const;

const REQUIRED_FIELDS = ['title'];

const BulkImport = () => {
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importStatus, setImportStatus] = useState<'idle' | 'preview' | 'importing' | 'done'>('idle');
  const [defaultStatus, setDefaultStatus] = useState<string>('draft');
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] }>({ success: 0, failed: 0, errors: [] });
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const headers = result.meta.fields || [];
        setCsvHeaders(headers);
        setCsvRows(result.data as Record<string, string>[]);
        // Auto-map matching headers
        const autoMap: Record<string, string> = {};
        headers.forEach((h) => {
          const lower = h.toLowerCase().replace(/[\s_-]+/g, '_');
          const match = DB_FIELDS.find((f) => f === lower);
          if (match) autoMap[h] = match;
        });
        setMapping(autoMap);
        setImportStatus('preview');
      },
      error: () => toast({ title: 'Failed to parse CSV', variant: 'destructive' }),
    });
  };

  const mappedRows = csvRows.map((row) => {
    const mapped: Record<string, any> = {};
    Object.entries(mapping).forEach(([csvCol, dbField]) => {
      if (!dbField || dbField === '_skip') return;
      let val: any = row[csvCol]?.trim();
      if (!val) return;
      if (dbField === 'genre' || dbField === 'tags') {
        val = val.split(/[,;|]/).map((s: string) => s.trim()).filter(Boolean);
      } else if (dbField === 'release_year' || dbField === 'duration_minutes') {
        val = parseInt(val, 10) || null;
      }
      mapped[dbField] = val;
    });
    return mapped;
  });

  const validRows = mappedRows.filter((r) => r.title);
  const invalidCount = mappedRows.length - validRows.length;

  const handleImport = async () => {
    setImportStatus('importing');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: 'Not authenticated', variant: 'destructive' });
      setImportStatus('preview');
      return;
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    const CHUNK = 50;

    for (let i = 0; i < validRows.length; i += CHUNK) {
      const chunk = validRows.slice(i, i + CHUNK).map((row) => ({
        ...row,
        creator_id: session.user.id,
        status: defaultStatus,
      }));
      const { error } = await supabase.from('films').insert(chunk);
      if (error) {
        failed += chunk.length;
        errors.push(`Rows ${i + 1}-${i + chunk.length}: ${error.message}`);
      } else {
        success += chunk.length;
      }
    }

    setResults({ success, failed, errors });
    setImportStatus('done');
    toast({ title: `Import complete: ${success} added, ${failed} failed` });
  };

  const reset = () => {
    setCsvHeaders([]);
    setCsvRows([]);
    setMapping({});
    setImportStatus('idle');
    setResults({ success: 0, failed: 0, errors: [] });
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Bulk Import Films</h1>
      <p className="text-muted-foreground font-body text-sm mb-6">
        Upload a CSV file to import multiple films at once. Required column: <span className="text-primary font-mono text-xs">title</span>
      </p>

      {importStatus === 'idle' && (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border rounded-sm p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Upload className="mx-auto mb-4 text-muted-foreground" size={32} />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Click to upload CSV</p>
          <p className="text-muted-foreground text-xs">Supports .csv files</p>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
        </div>
      )}

      {importStatus === 'preview' && (
        <div className="space-y-6">
          {/* Column mapping */}
          <div className="bg-card gold-border rounded-sm p-6">
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText size={16} className="text-primary" /> Column Mapping
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {csvHeaders.map((header) => (
                <div key={header} className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground w-28 truncate" title={header}>{header}</span>
                  <span className="text-muted-foreground">→</span>
                  <Select value={mapping[header] || '_skip'} onValueChange={(v) => setMapping((m) => ({ ...m, [header]: v }))}>
                    <SelectTrigger className="h-8 bg-surface border-border text-xs flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_skip" className="text-xs text-muted-foreground">Skip</SelectItem>
                      {DB_FIELDS.map((f) => (
                        <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Import options */}
          <div className="bg-card gold-border rounded-sm p-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Default Status:</span>
              <Select value={defaultStatus} onValueChange={setDefaultStatus}>
                <SelectTrigger className="h-8 w-28 bg-surface border-border text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['draft', 'pending', 'live'].map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={14} className="text-green-500" />
              <span className="text-foreground">{validRows.length} valid</span>
              {invalidCount > 0 && (
                <>
                  <AlertCircle size={14} className="text-destructive ml-2" />
                  <span className="text-destructive">{invalidCount} missing title</span>
                </>
              )}
            </div>
          </div>

          {/* Preview table */}
          <div className="bg-card gold-border rounded-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest">#</TableHead>
                  {Object.entries(mapping).filter(([, v]) => v && v !== '_skip').map(([, dbField]) => (
                    <TableHead key={dbField} className="font-mono text-[10px] uppercase tracking-widest">{dbField}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappedRows.slice(0, 10).map((row, i) => (
                  <TableRow key={i} className={!row.title ? 'opacity-40' : ''}>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{i + 1}</TableCell>
                    {Object.entries(mapping).filter(([, v]) => v && v !== '_skip').map(([, dbField]) => (
                      <TableCell key={dbField} className="text-xs text-foreground max-w-[200px] truncate">
                        {Array.isArray(row[dbField]) ? (row[dbField] as string[]).join(', ') : String(row[dbField] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {mappedRows.length > 10 && (
              <p className="text-center text-muted-foreground text-xs py-3">Showing 10 of {mappedRows.length} rows</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleImport} disabled={validRows.length === 0} className="bg-primary text-primary-foreground">
              Import {validRows.length} Films
            </Button>
            <Button variant="outline" onClick={reset} className="gold-border">Cancel</Button>
          </div>
        </div>
      )}

      {importStatus === 'importing' && (
        <div className="text-center py-16">
          <Loader2 className="mx-auto mb-4 animate-spin text-primary" size={32} />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Importing films...</p>
        </div>
      )}

      {importStatus === 'done' && (
        <div className="space-y-4">
          <div className="bg-card gold-border rounded-sm p-6 text-center">
            <CheckCircle2 className="mx-auto mb-3 text-green-500" size={32} />
            <p className="font-display text-lg font-bold text-foreground">{results.success} films imported</p>
            {results.failed > 0 && <p className="text-destructive text-sm mt-1">{results.failed} failed</p>}
            {results.errors.length > 0 && (
              <div className="mt-4 text-left">
                {results.errors.map((err, i) => (
                  <p key={i} className="text-destructive text-xs font-mono">{err}</p>
                ))}
              </div>
            )}
          </div>
          <Button onClick={reset} className="bg-primary text-primary-foreground">Import More</Button>
        </div>
      )}
    </div>
  );
};

export default BulkImport;
