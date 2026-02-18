import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BeforeAfterComparisonProps {
  beforePhotoId: string;
  afterPhotoId?: string;
  status: string;
}

export default function BeforeAfterComparison({ beforePhotoId, afterPhotoId, status }: BeforeAfterComparisonProps) {
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
            <img src={beforePhotoId} alt="Before" className="w-full h-64 object-cover rounded-lg" />
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
              <img src={afterPhotoId} alt="After" className="w-full h-64 object-cover rounded-lg" />
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
