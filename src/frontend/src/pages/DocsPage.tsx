import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Terminal, CheckCircle } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Civic Lens Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Step-by-step guide to set up and run the Civic Lens project
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prerequisites</CardTitle>
            <CardDescription>Before you begin, ensure you have the following installed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Node.js (v18 or higher)</p>
                <p className="text-sm text-muted-foreground">Download from nodejs.org</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">DFX (Internet Computer SDK)</p>
                <p className="text-sm text-muted-foreground">Install via: sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">VS Code</p>
                <p className="text-sm text-muted-foreground">Download from code.visualstudio.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>Follow these steps to get Civic Lens running locally</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">1. Open Project in VS Code</h3>
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  <code>cd Civic-Lens && code .</code>
                </AlertDescription>
              </Alert>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Install Dependencies</h3>
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  <code>cd frontend && npm install</code>
                </AlertDescription>
              </Alert>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Start Local Internet Computer</h3>
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  <code>dfx start --clean --background</code>
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground mt-2">
                This starts a local replica of the Internet Computer blockchain
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Deploy Backend Canister</h3>
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  <code>dfx deploy backend</code>
                </AlertDescription>
              </Alert>
            </div>

            <div>
              <h3 className="font-semibold mb-2">5. Generate Type Bindings</h3>
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  <code>dfx generate backend</code>
                </AlertDescription>
              </Alert>
            </div>

            <div>
              <h3 className="font-semibold mb-2">6. Start Frontend Development Server</h3>
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  <code>cd frontend && npm start</code>
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground mt-2">
                The application will be available at http://localhost:3000
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>Common issues and solutions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">DFX is not running</h3>
              <p className="text-sm text-muted-foreground mb-2">
                If you see errors about canister not found or connection refused:
              </p>
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  <code>dfx start --clean --background</code>
                </AlertDescription>
              </Alert>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Canister ID mismatch</h3>
              <p className="text-sm text-muted-foreground mb-2">
                If the frontend can't connect to the backend:
              </p>
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  <code>dfx generate backend && cd frontend && npm start</code>
                </AlertDescription>
              </Alert>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Port already in use</h3>
              <p className="text-sm text-muted-foreground mb-2">
                If port 3000 is already in use:
              </p>
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  <code>PORT=3001 npm start</code>
                </AlertDescription>
              </Alert>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Clean restart</h3>
              <p className="text-sm text-muted-foreground mb-2">
                If you encounter persistent issues, try a clean restart:
              </p>
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  <code>dfx stop && dfx start --clean --background && dfx deploy</code>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
