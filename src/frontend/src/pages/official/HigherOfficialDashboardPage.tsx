import { Link } from '@tanstack/react-router';
import { useGetComplaintsByStatus, useIsCallerAdmin } from '../../hooks/useQueries';
import { Status } from '../../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EscalationFlag from '../../components/complaints/EscalationFlag';
import PriorityScoreBadge from '../../components/complaints/PriorityScoreBadge';
import { Eye, AlertCircle } from 'lucide-react';

export default function HigherOfficialDashboardPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: escalatedComplaints, isLoading } = useGetComplaintsByStatus(Status.escalated);

  if (adminLoading || isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-12">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You do not have permission to access this page</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Escalated Issues</h1>
        <p className="text-muted-foreground">Review complaints that exceeded the 72-hour response window</p>
      </div>

      {!escalatedComplaints || escalatedComplaints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No escalated complaints at this time</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {escalatedComplaints.map((complaint) => (
            <Card key={complaint.id.toString()} className="border-destructive/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {complaint.publicId}
                      <Badge variant="destructive">Escalated</Badge>
                      <Badge>{complaint.category}</Badge>
                    </CardTitle>
                    <CardDescription>{complaint.location}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <PriorityScoreBadge score={complaint.priorityScore} />
                    <EscalationFlag escalatedAt={complaint.escalatedAt} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/complaint/$id" params={{ id: complaint.id.toString() }}>
                      <Eye className="mr-2 h-4 w-4" />
                      Review Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
