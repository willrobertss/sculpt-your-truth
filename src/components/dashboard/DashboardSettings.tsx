import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Props {
  profile: any;
  user: any;
  onProfileUpdate?: () => void;
}

const GENRE_OPTIONS = [
  'Drama', 'Comedy', 'Horror', 'Thriller', 'Sci-Fi', 'Documentary',
  'Action', 'Romance', 'Animation', 'Fantasy', 'Mystery', 'Experimental',
];

const DashboardSettings = ({ profile, user, onProfileUpdate }: Props) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [genreFocus, setGenreFocus] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync form state when profile loads or changes
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setWebsite(profile.website || '');
      setGenreFocus(profile.genre_focus || []);
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } else {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(publicUrl + '?t=' + Date.now());
    }
    setUploading(false);
  };

  const toggleGenre = (g: string) => {
    setGenreFocus(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      display_name: displayName,
      bio,
      location,
      website,
      genre_focus: genreFocus,
      avatar_url: avatarUrl.split('?')[0],
    }).eq('user_id', user.id);

    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile saved!' });
      onProfileUpdate?.();
    }
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">Edit Profile</h2>

      {/* Avatar */}
      <div className="flex items-center gap-6 mb-8">
        <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
          <div className="w-24 h-24 rounded-full overflow-hidden gold-border gold-glow bg-muted">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Camera size={28} />
              </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? <Loader2 size={20} className="animate-spin text-primary" /> : <Camera size={20} className="text-primary" />}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Profile Photo</p>
          <p className="text-xs text-muted-foreground mt-1">Click to upload</p>
        </div>
      </div>

      <div className="bg-card gold-border rounded-sm p-6 space-y-5">
        {/* Display Name */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Display Name</label>
          <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name or stage name" />
        </div>

        {/* Bio */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Bio</label>
          <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell the world about your creative journey..." rows={4} />
        </div>

        {/* Location */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Location</label>
          <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Los Angeles, CA" />
        </div>

        {/* Website */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Website</label>
          <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yoursite.com" />
        </div>

        {/* Genre Focus */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Genre Focus</label>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-sm border transition-colors ${
                  genreFocus.includes(g)
                    ? 'bg-primary/20 text-primary border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground'
                }`}
              >
                {g}
                {genreFocus.includes(g) && <X size={8} className="inline ml-1" />}
              </button>
            ))}
          </div>
        </div>

        {/* Read-only fields */}
        <div className="pt-4 border-t border-border space-y-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Creator Slug</label>
            <p className="text-foreground font-mono text-sm">{profile?.slug || '—'}</p>
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Email</label>
            <p className="text-foreground text-sm">{user.email}</p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full mt-4">
          {saving ? <><Loader2 size={14} className="animate-spin mr-2" /> Saving...</> : 'Save Profile'}
        </Button>
      </div>
    </motion.div>
  );
};

export default DashboardSettings;
