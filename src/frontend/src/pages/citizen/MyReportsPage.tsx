import { Link } from '@tanstack/react-router';
import { useGetOpenComplaints } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import SlaBadge from '../../components/complaints/SlaBadge';
import PriorityScoreBadge from '../../components/complaints/PriorityScoreBadge';
import { FileText, Eye } from 'lucide-react';

export default function MyReportsPage() {
  const { data: complaints, isLoading } = useGetOpenComplaints();

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!complaints || complaints.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <img
            src="/assets/generated/empty-reports-illustration.dim_1200x800.png"
            alt="No reports"
            className="w-full max-w-md mx-auto rounded-lg"
          />
          <h2 className="text-2xl font-bold">No Reports Yet</h2>
          <p className="text-muted-foreground">You haven't submitted any complaints yet. Start making a difference!</p>
          <Button asChild>
            <Link to="/submit">
              <FileText className="mr-2 h-4 w-4" />
              Report an Issue
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Reports</h1>
        <p className="text-muted-foreground">Track the status of your submitted complaints</p>
      </div>

      <div className="grid gap-6">
        {complaints.map((complaint) => (
          <Card key={complaint.id.toString()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {complaint.publicId}
                    <Badge variant={complaint.status === 'resolved' ? 'default' : 'secondary'}>
                      {complaint.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{complaint.category}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <PriorityScoreBadge score={complaint.priorityScore} />
                  <SlaBadge dueAt={complaint.dueAt} status={complaint.status} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Location</p>
                  <p className="text-sm text-muted-foreground">{complaint.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/complaint/$id" params={{ id: complaint.id.toString() }}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
