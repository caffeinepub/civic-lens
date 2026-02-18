import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EscalationFlagProps {
  escalatedAt?: bigint;
}

export default function EscalationFlag({ escalatedAt }: EscalationFlagProps) {
  if (!escalatedAt) return null;

  const escalatedDate = new Date(Number(escalatedAt) / 1000000);
  const timeAgo = formatDistanceToNow(escalatedDate, { addSuffix: true });

  return (
    <Badge variant="destructive" className="flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" />
      Escalated {timeAgo}
    </Badge>
  );
}
