import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PaginatedTable from './PaginatedTable';
import StatusBadge from './StatusBadge';
import VideoApprovalDialog from './VideoApprovalDialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

const PAGE_SIZE = 10;

interface VideoRow {
  id: string;
  title: string;
  synopsis: string | null;
  thumbnail: string | null;
  approved: boolean;
  thumb_approved: boolean;
  reviewed: boolean;
  director?: string;
  created_at: string;
}

const STORAGE_BASE = import.meta.env.VITE_FILE_STORAGE_PATH || '';

const VideoPendingSection = () => {
  const [data, setData] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .eq('approved', false)
      .eq('reviewed', false)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) { setLoading(false); return; }

    // Fetch directors for these videos
    const ids = (videos || []).map((v: any) => v.id);
    let directorsMap: Record<string, string> = {};
    if (ids.length) {
      const { data: credits } = await supabase
        .from('credits')
        .select('video_id, name')
        .in('video_id', ids)
        .eq('role', 'Director');
      if (credits) {
        credits.forEach((c: any) => { directorsMap[c.video_id] = c.name; });
      }
    }

    setData((videos || []).map((v: any) => ({ ...v, director: directorsMap[v.id] })));
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    {
      key: 'thumbnail',
      header: 'Thumb',
      render: (row: VideoRow) => {
        const src = row.thumbnail ? (row.thumbnail.startsWith('http') ? row.thumbnail : `${STORAGE_BASE}${row.thumbnail}`) : null;
        return src ? <img src={src} alt="" className="w-16 h-10 object-cover rounded" /> : <div className="w-16 h-10 bg-gray-100 rounded" />;
      },
    },
    { key: 'title', header: 'Title', render: (row: VideoRow) => <span className="font-heading font-medium">{row.title}</span> },
    { key: 'director', header: 'Director', render: (row: VideoRow) => row.director || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (row: VideoRow) => (
        <div className="flex gap-1">
          <StatusBadge approved={row.approved} />
          <StatusBadge approved={row.thumb_approved} label={row.thumb_approved ? 'Thumb OK' : 'Thumb'} />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: VideoRow) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedVideo(row)} className="border-gray-300 text-gray-700 hover:bg-gray-100 font-heading uppercase text-xs tracking-wider">
          <Eye size={14} className="mr-1" /> View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2 className="font-heading text-xl uppercase tracking-wide text-black mb-4">Videos Pending Approval</h2>
      <PaginatedTable columns={columns} data={data} loading={loading} page={page} onPageChange={setPage} pageSize={PAGE_SIZE} />
      <VideoApprovalDialog video={selectedVideo} open={!!selectedVideo} onOpenChange={(o) => { if (!o) setSelectedVideo(null); }} onAction={fetchData} />
    </div>
  );
};

export default VideoPendingSection;
