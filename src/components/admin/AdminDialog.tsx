import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface AdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const AdminDialog = ({ open, onOpenChange, title, description, children, className }: AdminDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={`bg-noir text-white border-gray-700 max-w-2xl ${className ?? ''}`}>
      <DialogHeader>
        <DialogTitle className="font-heading text-2xl uppercase tracking-wide">{title}</DialogTitle>
        {description && <DialogDescription className="font-sans text-sm text-gray-500">{description}</DialogDescription>}
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);

export default AdminDialog;
