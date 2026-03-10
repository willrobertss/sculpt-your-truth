import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import DateRangeFilter from './DateRangeFilter';
import PaginatedTable from './PaginatedTable';

const PAGE_SIZE = 10;

interface ReportSection {
  title: string;
  exportName: string;
  fetchFn: (from: string, to: string, page: number) => Promise<any[]>;
  columns: { key: string; header: string; render: (row: any) => React.ReactNode }[];
}

const FinancialsPanel = () => {
  const sections: ReportSection[] = [
    {
      title: 'Pool Report',
      exportName: 'Pool Report',
      columns: [
        { key: 'title', header: 'Title', render: (r: any) => r.title },
        { key: 'approved', header: 'Approved', render: (r: any) => r.approved ? 'Yes' : 'No' },
        { key: 'created_at', header: 'Date', render: (r: any) => new Date(r.created_at).toLocaleDateString() },
      ],
      fetchFn: async (from, to, page) => {
        let q = supabase.from('videos').select('id, title, approved, created_at').order('created_at', { ascending: false }).range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
        if (from) q = q.gte('created_at', from);
        if (to) q = q.lte('created_at', `${to}T23:59:59`);
        const { data } = await q;
        return data || [];
      },
    },
    {
      title: 'Referral Reward Report',
      exportName: 'Referral Report',
      columns: [
        { key: 'referrer_id', header: 'Referrer', render: (r: any) => r.referrer_id?.slice(0, 8) + '...' },
        { key: 'referred_user_id', header: 'Referred', render: (r: any) => r.referred_user_id?.slice(0, 8) + '...' },
        { key: 'is_active', header: 'Active', render: (r: any) => r.is_active ? 'Yes' : 'No' },
        { key: 'created_at', header: 'Date', render: (r: any) => new Date(r.created_at).toLocaleDateString() },
      ],
      fetchFn: async (from, to, page) => {
        let q = supabase.from('referrals').select('*').order('created_at', { ascending: false }).range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
        if (from) q = q.gte('created_at', from);
        if (to) q = q.lte('created_at', `${to}T23:59:59`);
        const { data } = await q;
        return data || [];
      },
    },
    {
      title: 'Income Payment Report',
      exportName: 'Payment History',
      columns: [
        { key: 'info', header: 'Info', render: () => 'No payment data yet' },
      ],
      fetchFn: async () => [],
    },
  ];

  return (
    <div>
      <h2 className="font-heading text-2xl uppercase tracking-wide text-black mb-6">Financials</h2>
      <Accordion type="multiple" className="space-y-4">
        {sections.map((section, idx) => (
          <AccordionItem key={idx} value={`section-${idx}`} className="border border-gray-200 rounded-lg bg-white">
            <AccordionTrigger className="px-4 py-3 font-heading text-lg uppercase tracking-wide text-black hover:no-underline">
              {section.title}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <ReportContent section={section} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

const ReportContent = ({ section }: { section: ReportSection }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    const result = await section.fetchFn(dateFrom, dateTo, page);
    setData(result);
    setLoading(false);
  }, [dateFrom, dateTo, page, section]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleExport = async () => {
    // Fetch all pages for export
    const all = await section.fetchFn(dateFrom, dateTo, 0);
    const ws = XLSX.utils.json_to_sheet(all);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${section.exportName}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <DateRangeFilter onApply={(f, t) => { setDateFrom(f); setDateTo(t); setPage(0); }} />
        <Button variant="outline" onClick={handleExport} className="border-gray-300 text-gray-700 font-heading uppercase text-xs tracking-wider">
          <Download size={14} className="mr-1" /> Export Excel
        </Button>
      </div>
      <PaginatedTable columns={section.columns} data={data} loading={loading} page={page} onPageChange={setPage} pageSize={PAGE_SIZE} />
    </div>
  );
};

export default FinancialsPanel;
