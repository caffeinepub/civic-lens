import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useSubmitComplaint } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PhotoUploader from '../../components/complaints/PhotoUploader';
import SignInOptions from '../../components/auth/SignInOptions';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SubmitComplaintPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const submitMutation = useSubmitComplaint();

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const isAuthenticated = !!identity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoFile) {
      toast.error('Please upload a photo of the issue');
      return;
    }

    try {
      const publicId = `CL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await submitMutation.mutateAsync({
        category,
        description,
        location,
        photoFile,
        publicId,
      });

      toast.success('Complaint submitted successfully!', {
        description: `Your complaint ID is ${publicId}`,
      });

      navigate({ to: '/my-reports' });
    } catch (error: any) {
      toast.error('Failed to submit complaint', {
        description: error.message || 'Please try again',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription className="mt-4 space-y-4">
              <p>Please sign in with Google or Apple to submit a complaint and help improve your community.</p>
              <SignInOptions />
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Report a Civic Issue</CardTitle>
            <CardDescription>
              Help improve your community by reporting issues. Officials will respond within 72 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select issue category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High Priority">Pothole</SelectItem>
                    <SelectItem value="Moderate Priority">Garbage Disposal</SelectItem>
                    <SelectItem value="High Priority">Street Light</SelectItem>
                    <SelectItem value="Moderate Priority">Water Leakage</SelectItem>
                    <SelectItem value="Low Priority">Graffiti</SelectItem>
                    <SelectItem value="Low Priority">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Main Street near City Hall"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Photo Evidence *</Label>
                <PhotoUploader onPhotoSelected={setPhotoFile} />
              </div>

              <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Complaint'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
