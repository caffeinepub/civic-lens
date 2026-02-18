import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SlaBadgeProps {
  dueAt: bigint;
  status: string;
}

export default function SlaBadge({ dueAt, status }: SlaBadgeProps) {
  const dueDate = new Date(Number(dueAt) / 1000000);
  const now = new Date();
  const isOverdue = now > dueDate && status !== 'resolved' && status !== 'citizenConfirmed';

  const timeRemaining = formatDistanceToNow(dueDate, { addSuffix: true });

  if (isOverdue) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Overdue
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <Clock className="h-3 w-3" />
      {timeRemaining}
    </Badge>
  );
}
