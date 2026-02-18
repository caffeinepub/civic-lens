import { useState } from 'react';
import { useSubmitFeedback } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Star } from 'lucide-react';

interface ResolutionFeedbackFormProps {
  complaintId: bigint;
}

export default function ResolutionFeedbackForm({ complaintId }: ResolutionFeedbackFormProps) {
  const [confirmed, setConfirmed] = useState<string>('yes');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const submitFeedbackMutation = useSubmitFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitFeedbackMutation.mutateAsync({
        complaintId,
        comment,
        rating: BigInt(rating),
        confirmed: confirmed === 'yes',
      });

      toast.success('Feedback submitted successfully');
    } catch (error: any) {
      toast.error('Failed to submit feedback', {
        description: error.message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Resolution</CardTitle>
        <CardDescription>Please provide feedback on the resolution of this issue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Was this issue resolved satisfactorily?</Label>
            <RadioGroup value={confirmed} onValueChange={setConfirmed}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="font-normal cursor-pointer">
                  Yes, the issue is resolved
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="font-normal cursor-pointer">
                  No, the issue is not resolved
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="comment">Additional Comments</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitFeedbackMutation.isPending}>
            {submitFeedbackMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
