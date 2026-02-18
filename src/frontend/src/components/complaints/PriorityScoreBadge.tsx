import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { PriorityScore } from '../../backend';

interface PriorityScoreBadgeProps {
  score: PriorityScore;
}

export default function PriorityScoreBadge({ score }: PriorityScoreBadgeProps) {
  const urgency = Number(score.urgency);

  const getVariant = () => {
    if (urgency >= 4) return 'destructive';
    if (urgency >= 3) return 'default';
    return 'secondary';
  };

  const getIcon = () => {
    if (urgency >= 4) return <AlertCircle className="h-3 w-3" />;
    if (urgency >= 3) return <AlertTriangle className="h-3 w-3" />;
    return <Info className="h-3 w-3" />;
  };

  const getLabel = () => {
    if (urgency >= 4) return 'High Priority';
    if (urgency >= 3) return 'Medium Priority';
    return 'Low Priority';
  };

  return (
    <Badge variant={getVariant()} className="flex items-center gap-1">
      {getIcon()}
      {getLabel()}
    </Badge>
  );
}
