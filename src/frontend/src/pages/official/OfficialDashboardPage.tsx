import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useGetComplaintsByStatus, useIsCallerAdmin } from '../../hooks/useQueries';
import { Status } from '../../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SlaBadge from '../../components/complaints/SlaBadge';
import PriorityScoreBadge from '../../components/complaints/PriorityScoreBadge';
import { Eye, AlertCircle } from 'lucide-react';

export default function OfficialDashboardPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const [activeTab, setActiveTab] = useState('open');

  const { data: openComplaints, isLoading: openLoading } = useGetComplaintsByStatus(Status.open);
  const { data: inProgressComplaints, isLoading: inProgressLoading } = useGetComplaintsByStatus(Status.inProgress);

  if (adminLoading) {
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

  const renderComplaintList = (complaints: any[] | undefined, isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      );
    }

    if (!complaints || complaints.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No complaints in this category</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {complaints.map((complaint) => (
          <Card key={complaint.id.toString()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {complaint.publicId}
                    <Badge>{complaint.category}</Badge>
                  </CardTitle>
                  <CardDescription>{complaint.location}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <PriorityScoreBadge score={complaint.priorityScore} />
                  <SlaBadge dueAt={complaint.dueAt} status={complaint.status} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/complaint/$id" params={{ id: complaint.id.toString() }}>
                    <Eye className="mr-2 h-4 w-4" />
                    View & Manage
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Official Dashboard</h1>
        <p className="text-muted-foreground">Manage and resolve civic complaints</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="open">Open ({openComplaints?.length || 0})</TabsTrigger>
          <TabsTrigger value="inProgress">In Progress ({inProgressComplaints?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="open" className="mt-6">
          {renderComplaintList(openComplaints, openLoading)}
        </TabsContent>
        <TabsContent value="inProgress" className="mt-6">
          {renderComplaintList(inProgressComplaints, inProgressLoading)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
