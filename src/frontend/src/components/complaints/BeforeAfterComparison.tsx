import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetPhotoUrl } from '../../hooks/useQueries';
import { AlertCircle } from 'lucide-react';

interface BeforeAfterComparisonProps {
  beforePhotoId: string;
  afterPhotoId?: string;
  status: string;
}

export default function BeforeAfterComparison({ beforePhotoId, afterPhotoId, status }: BeforeAfterComparisonProps) {
  const { data: beforePhotoUrl, isLoading: beforeLoading, isError: beforeError } = useGetPhotoUrl(beforePhotoId);
  const { data: afterPhotoUrl, isLoading: afterLoading, isError: afterError } = useGetPhotoUrl(afterPhotoId);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Photo Evidence</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Before
              <Badge variant="outline">Original</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {beforeLoading ? (
              <Skeleton className="w-full h-64 rounded-lg" />
            ) : beforeError || !beforePhotoUrl ? (
              <div className="w-full h-64 bg-muted rounded-lg flex flex-col items-center justify-center gap-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Failed to load photo</p>
              </div>
            ) : (
              <img src={beforePhotoUrl} alt="Before" className="w-full h-64 object-cover rounded-lg" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              After
              {status === 'resolved' || status === 'citizenConfirmed' ? (
                <Badge>Resolved</Badge>
              ) : (
                <Badge variant="secondary">Pending</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {afterPhotoId ? (
              afterLoading ? (
                <Skeleton className="w-full h-64 rounded-lg" />
              ) : afterError || !afterPhotoUrl ? (
                <div className="w-full h-64 bg-muted rounded-lg flex flex-col items-center justify-center gap-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Failed to load photo</p>
                </div>
              ) : (
                <img src={afterPhotoUrl} alt="After" className="w-full h-64 object-cover rounded-lg" />
              )
            ) : (
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">After photo pending</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
