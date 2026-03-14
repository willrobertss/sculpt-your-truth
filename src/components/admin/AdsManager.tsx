import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { opprimeClient } from '@/lib/opprime-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminDialog from './AdminDialog';
import PaginatedTable from './PaginatedTable';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, Film } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  video_url: string;
  duration_seconds: number;
  is_active: boolean;
  created_at: string;
}

interface AdPlacement {
  id: string;
  ad_id: string;
  video_id: string;
  placement: 'pre_roll' | 'mid_roll' | 'post_roll';
  trigger_at_seconds: number | null;
  created_at: string;
  ads?: Ad;
}

interface OPVideo {
  id: string;
  title: string;
}

const PLACEMENT_LABELS: Record<string, string> = {
  pre_roll: 'Pre-Roll (Before)',
  mid_roll: 'Mid-Roll (During)',
  post_roll: 'Post-Roll (After)',
};

const AdsManager = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [opVideos, setOpVideos] = useState<OPVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [adsPage, setAdsPage] = useState(0);
  const [placementsPage, setPlacementsPage] = useState(0);

  // Upload dialog
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDuration, setUploadDuration] = useState(30);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Assign dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignAdId, setAssignAdId] = useState('');
  const [assignVideoId, setAssignVideoId] = useState('');
  const [assignPlacement, setAssignPlacement] = useState<string>('pre_roll');
  const [assignTrigger, setAssignTrigger] = useState(0);
  const [assigning, setAssigning] = useState(false);
  const [videoSearch, setVideoSearch] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    const [adsRes, placementsRes, videosRes] = await Promise.all([
      supabase.from('ads').select('*').order('created_at', { ascending: false }),
      supabase.from('ad_placements').select('*, ads(*)').order('created_at', { ascending: false }),
      opprimeClient.from('videos').select('id, title').limit(500),
    ]);
    setAds((adsRes.data as Ad[]) || []);
    setPlacements((placementsRes.data as AdPlacement[]) || []);
    setOpVideos((videosRes.data as OPVideo[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Upload ad
  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle.trim()) { toast.error('Title and file required'); return; }
    setUploading(true);
    const ext = uploadFile.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error: storageErr } = await supabase.storage.from('ads').upload(path, uploadFile);
    if (storageErr) { toast.error('Upload failed: ' + storageErr.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from('ads').getPublicUrl(path);
    const { error } = await supabase.from('ads').insert({
      title: uploadTitle.trim(),
      video_url: urlData.publicUrl,
      duration_seconds: uploadDuration,
    });
    if (error) { toast.error(error.message); } else {
      toast.success('Ad uploaded');
      setUploadOpen(false);
      setUploadTitle('');
      setUploadDuration(30);
      setUploadFile(null);
      fetchAll();
    }
    setUploading(false);
  };

  // Toggle active
  const toggleActive = async (ad: Ad) => {
    await supabase.from('ads').update({ is_active: !ad.is_active }).eq('id', ad.id);
    setAds(prev => prev.map(a => a.id === ad.id ? { ...a, is_active: !a.is_active } : a));
  };

  // Delete ad
  const deleteAd = async (id: string) => {
    await supabase.from('ads').delete().eq('id', id);
    toast.success('Ad deleted');
    fetchAll();
  };

  // Assign ad to video
  const handleAssign = async () => {
    if (!assignAdId || !assignVideoId) { toast.error('Select ad and video'); return; }
    setAssigning(true);
    const payload: any = {
      ad_id: assignAdId,
      video_id: assignVideoId,
      placement: assignPlacement,
    };
    if (assignPlacement === 'mid_roll') payload.trigger_at_seconds = assignTrigger;

    const { error } = await supabase.from('ad_placements').insert(payload);
    if (error) { toast.error(error.message); } else {
      toast.success('Ad assigned');
      setAssignOpen(false);
      setAssignAdId('');
      setAssignVideoId('');
      setAssignPlacement('pre_roll');
      setAssignTrigger(0);
      fetchAll();
    }
    setAssigning(false);
  };

  // Delete placement
  const deletePlacement = async (id: string) => {
    await supabase.from('ad_placements').delete().eq('id', id);
    toast.success('Placement removed');
    fetchAll();
  };

  const videoTitle = (vid: string) => opVideos.find(v => String(v.id) === vid)?.title || vid;

  const adColumns = [
    { key: 'title', header: 'Title', render: (ad: Ad) => ad.title },
    { key: 'duration', header: 'Duration', render: (ad: Ad) => `${ad.duration_seconds}s` },
    { key: 'active', header: 'Active', render: (ad: Ad) => (
      <Switch checked={ad.is_active} onCheckedChange={() => toggleActive(ad)} />
    )},
    { key: 'actions', header: '', render: (ad: Ad) => (
      <Button variant="ghost" size="sm" onClick={() => deleteAd(ad.id)} className="text-red-500 hover:text-red-700">
        <Trash2 size={14} />
      </Button>
    )},
  ];

  const placementColumns = [
    { key: 'ad', header: 'Ad', render: (p: AdPlacement) => p.ads?.title || p.ad_id },
    { key: 'video', header: 'Video', render: (p: AdPlacement) => (
      <span className="max-w-[200px] truncate block">{videoTitle(p.video_id)}</span>
    )},
    { key: 'placement', header: 'Placement', render: (p: AdPlacement) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-heading uppercase tracking-wider bg-gray-100 text-gray-700">
        {PLACEMENT_LABELS[p.placement] || p.placement}
      </span>
    )},
    { key: 'trigger', header: 'Trigger At', render: (p: AdPlacement) =>
      p.placement === 'mid_roll' ? `${p.trigger_at_seconds}s` : '—'
    },
    { key: 'actions', header: '', render: (p: AdPlacement) => (
      <Button variant="ghost" size="sm" onClick={() => deletePlacement(p.id)} className="text-red-500 hover:text-red-700">
        <Trash2 size={14} />
      </Button>
    )},
  ];

  return (
    <div className="space-y-12">
      {/* Ad Library */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wide text-black">Ad Library</h2>
            <p className="font-sans text-sm text-gray-500 mt-1">Upload and manage your commercials</p>
          </div>
          <Button onClick={() => setUploadOpen(true)} className="bg-black text-white hover:bg-gray-800 font-heading text-xs uppercase tracking-widest">
            <Upload size={14} className="mr-2" /> Upload Ad
          </Button>
        </div>
        <PaginatedTable columns={adColumns} data={ads} loading={loading} page={adsPage} onPageChange={setAdsPage} />
      </section>

      {/* Ad Placements */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wide text-black">Ad Placements</h2>
            <p className="font-sans text-sm text-gray-500 mt-1">Assign ads to play before, during, or after videos</p>
          </div>
          <Button onClick={() => setAssignOpen(true)} disabled={ads.length === 0} className="bg-black text-white hover:bg-gray-800 font-heading text-xs uppercase tracking-widest">
            <Plus size={14} className="mr-2" /> Assign Ad
          </Button>
        </div>
        <PaginatedTable columns={placementColumns} data={placements} loading={loading} page={placementsPage} onPageChange={setPlacementsPage} />
      </section>

      {/* Upload Dialog */}
      <AdminDialog open={uploadOpen} onOpenChange={setUploadOpen} title="Upload New Ad" description="Upload a video commercial to the ad library">
        <div className="space-y-4 mt-4">
          <div>
            <label className="font-heading text-xs uppercase tracking-wider text-gray-400 block mb-1">Ad Title</label>
            <Input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="e.g. Spring Sale 2026" className="border-gray-600 bg-noir-light text-white placeholder:text-gray-500" />
          </div>
          <div>
            <label className="font-heading text-xs uppercase tracking-wider text-gray-400 block mb-1">Duration (seconds)</label>
            <Input type="number" value={uploadDuration} onChange={e => setUploadDuration(Number(e.target.value))} min={5} max={120} className="border-gray-600 bg-noir-light text-white" />
          </div>
          <div>
            <label className="font-heading text-xs uppercase tracking-wider text-gray-400 block mb-1">Video File</label>
            <input ref={fileRef} type="file" accept="video/*" onChange={e => setUploadFile(e.target.files?.[0] || null)} className="font-sans text-sm text-white" />
          </div>
          <Button onClick={handleUpload} disabled={uploading} className="w-full bg-black text-white hover:bg-gray-800 font-heading text-xs uppercase tracking-widest">
            {uploading ? 'Uploading...' : 'Upload Ad'}
          </Button>
        </div>
      </AdminDialog>

      {/* Assign Dialog */}
      <AdminDialog open={assignOpen} onOpenChange={setAssignOpen} title="Assign Ad to Video" description="Choose where and when the ad plays">
        <div className="space-y-4 mt-4">
          <div>
            <label className="font-heading text-xs uppercase tracking-wider text-gray-400 block mb-1">Select Ad</label>
            <Select value={assignAdId} onValueChange={setAssignAdId}>
              <SelectTrigger className="border-gray-600 bg-noir-light text-white"><SelectValue placeholder="Choose an ad" /></SelectTrigger>
              <SelectContent>
                {ads.filter(a => a.is_active).map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.title} ({a.duration_seconds}s)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-heading text-xs uppercase tracking-wider text-gray-400 block mb-1">Select Video</label>
            <Input
              placeholder="Search videos..."
              value={videoSearch}
              onChange={e => setVideoSearch(e.target.value)}
              className="border-gray-600 bg-noir-light text-white placeholder:text-gray-500 mb-2"
            />
            <Select value={assignVideoId} onValueChange={setAssignVideoId}>
              <SelectTrigger className="border-gray-600 bg-noir-light text-white"><SelectValue placeholder="Choose a video" /></SelectTrigger>
              <SelectContent>
                {opVideos
                  .filter(v => !videoSearch || v.title.toLowerCase().includes(videoSearch.toLowerCase()) || String(v.id).includes(videoSearch))
                  .map(v => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.title} <span className="text-gray-400 text-xs ml-1">({String(v.id).slice(0, 8)}…)</span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-heading text-xs uppercase tracking-wider text-gray-400 block mb-1">Placement</label>
            <Select value={assignPlacement} onValueChange={setAssignPlacement}>
              <SelectTrigger className="border-gray-600 bg-noir-light text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pre_roll">Pre-Roll (Before Video)</SelectItem>
                <SelectItem value="mid_roll">Mid-Roll (During Video)</SelectItem>
                <SelectItem value="post_roll">Post-Roll (After Video)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {assignPlacement === 'mid_roll' && (
            <div>
              <label className="font-heading text-xs uppercase tracking-wider text-gray-400 block mb-1">Trigger at (seconds into video)</label>
              <Input type="number" value={assignTrigger} onChange={e => setAssignTrigger(Number(e.target.value))} min={0} className="border-gray-600 bg-noir-light text-white" />
            </div>
          )}
          {assignAdId && assignVideoId && (
             <div className="bg-noir-light border border-gray-600 rounded p-3 text-sm space-y-1">
              <p className="font-heading text-xs uppercase tracking-wider text-gray-400">Preview</p>
              <p><strong>Ad:</strong> {ads.find(a => a.id === assignAdId)?.title}</p>
              <p><strong>Video:</strong> {videoTitle(assignVideoId)}</p>
              <p><strong>Placement:</strong> {PLACEMENT_LABELS[assignPlacement]}</p>
              <p className="text-gray-400 text-xs">Video ID: {assignVideoId}</p>
            </div>
          )}
          <Button onClick={handleAssign} disabled={assigning} className="w-full bg-black text-white hover:bg-gray-800 font-heading text-xs uppercase tracking-widest">
            {assigning ? 'Saving...' : 'Save Placement'}
          </Button>
        </div>
      </AdminDialog>
    </div>
  );
};

export default AdsManager;
