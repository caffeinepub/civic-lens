import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import type { Complaint } from '../../backend';
import PriorityScoreBadge from './PriorityScoreBadge';
import SlaBadge from './SlaBadge';

interface ComplaintMetaCardProps {
  complaint: Complaint;
}

export default function ComplaintMetaCard({ complaint }: ComplaintMetaCardProps) {
  const createdDate = new Date(Number(complaint.createdAt) / 1000000);
  const updatedDate = new Date(Number(complaint.updatedAt) / 1000000);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complaint Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Priority</p>
          <PriorityScoreBadge score={complaint.priorityScore} />
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium">Response Deadline</p>
          <SlaBadge dueAt={complaint.dueAt} status={complaint.status} />
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Created</p>
              <p className="text-muted-foreground">{format(createdDate, 'PPp')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Last Updated</p>
              <p className="text-muted-foreground">{format(updatedDate, 'PPp')}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Location</p>
              <p className="text-muted-foreground">{complaint.location}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Reporter</p>
              <p className="text-muted-foreground text-xs break-all">{complaint.reporter.toString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
