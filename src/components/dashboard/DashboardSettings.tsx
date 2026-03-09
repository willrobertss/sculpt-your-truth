import { motion } from 'framer-motion';

interface Props {
  profile: any;
  user: any;
}

const DashboardSettings = ({ profile, user }: Props) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <h2 className="font-display text-2xl font-bold text-foreground mb-6">Profile Settings</h2>
    <div className="bg-card gold-border rounded-sm p-6 max-w-lg">
      <div className="space-y-4">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Display Name</label>
          <p className="text-foreground">{profile?.display_name || '—'}</p>
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Email</label>
          <p className="text-foreground">{user.email}</p>
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Creator Slug</label>
          <p className="text-foreground font-mono text-sm">{profile?.slug || '—'}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

export default DashboardSettings;
