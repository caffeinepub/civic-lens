import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetComplaint, useUpdateComplaintStatus, useIsCallerAdmin } from '../../hooks/useQueries';
import { Status } from '../../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import ComplaintMetaCard from '../../components/complaints/ComplaintMetaCard';
import BeforeAfterComparison from '../../components/complaints/BeforeAfterComparison';
import ResolutionFeedbackForm from '../../components/feedback/ResolutionFeedbackForm';
import PhotoUploader from '../../components/complaints/PhotoUploader';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function ComplaintDetailPage() {
  const { id } = useParams({ from: '/complaint/$id' });
  const navigate = useNavigate();
  const { data: complaint, isLoading } = useGetComplaint(BigInt(id));
  const { data: isAdmin } = useIsCallerAdmin();
  const updateStatusMutation = useUpdateComplaintStatus();

  const [afterPhoto, setAfterPhoto] = useState<File | null>(null);
  const [showAfterPhotoUpload, setShowAfterPhotoUpload] = useState(false);

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="container py-12">
        <p className="text-center text-muted-foreground">Complaint not found</p>
      </div>
    );
  }

  const handleStatusUpdate = async (newStatus: Status) => {
    try {
      if (newStatus === Status.resolved && !afterPhoto) {
        toast.error('Please upload an after photo before marking as resolved');
        return;
      }

      await updateStatusMutation.mutateAsync({
        id: complaint.id,
        status: newStatus,
        afterPhoto: afterPhoto || undefined,
      });

      toast.success(`Complaint marked as ${newStatus}`);
      setShowAfterPhotoUpload(false);
      setAfterPhoto(null);
    } catch (error: any) {
      toast.error('Failed to update status', {
        description: error.message,
      });
    }
  };

  return (
    <div className="container py-12">
      <Button variant="ghost" onClick={() => navigate({ to: -1 as any })} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{complaint.publicId}</CardTitle>
                  <CardDescription className="mt-2">{complaint.category}</CardDescription>
                </div>
                <Badge variant={complaint.status === Status.resolved ? 'default' : 'secondary'}>{complaint.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Location</h3>
                <p className="text-muted-foreground">{complaint.location}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{complaint.description}</p>
              </div>

              <Separator />

              <BeforeAfterComparison 
                beforePhotoId={complaint.photoId} 
                afterPhotoId={complaint.afterPhotoId} 
                status={complaint.status} 
              />

              {isAdmin && complaint.status === Status.open && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-semibold">Official Actions</h3>
                    <Button
                      onClick={() => handleStatusUpdate(Status.inProgress)}
                      disabled={updateStatusMutation.isPending}
                      className="w-full"
                    >
                      {updateStatusMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Mark as In Progress'
                      )}
                    </Button>
                  </div>
                </>
              )}

              {isAdmin && complaint.status === Status.inProgress && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-semibold">Mark as Resolved</h3>
                    <p className="text-sm text-muted-foreground">Upload an after photo to mark this complaint as resolved</p>
                    {!showAfterPhotoUpload ? (
                      <Button onClick={() => setShowAfterPhotoUpload(true)} variant="outline" className="w-full">
                        Upload After Photo
                      </Button>
                    ) : (
                      <>
                        <PhotoUploader onPhotoSelected={setAfterPhoto} />
                        {afterPhoto && (
                          <Button
                            onClick={() => handleStatusUpdate(Status.resolved)}
                            disabled={updateStatusMutation.isPending}
                            className="w-full"
                          >
                            {updateStatusMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resolving...
                              </>
                            ) : (
                              'Mark as Resolved'
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}

              {complaint.status === Status.resolved && !complaint.feedback && (
                <>
                  <Separator />
                  <ResolutionFeedbackForm complaintId={complaint.id} />
                </>
              )}

              {complaint.feedback && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold">Citizen Feedback</h3>
                    <Badge variant={complaint.feedback.confirmed ? 'default' : 'destructive'}>
                      {complaint.feedback.confirmed ? 'Confirmed' : 'Not Resolved'}
                    </Badge>
                    {complaint.feedback.rating && <p className="text-sm">Rating: {Number(complaint.feedback.rating)}/5</p>}
                    <p className="text-sm text-muted-foreground">{complaint.feedback.comment}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <ComplaintMetaCard complaint={complaint} />
        </div>
      </div>
    </div>
  );
}
