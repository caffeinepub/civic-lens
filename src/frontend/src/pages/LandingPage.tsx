import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Clock, CheckCircle, MessageSquare, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="flex flex-col">
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Report. Track. Resolve.
                <span className="block text-primary mt-2">Civic Issues Made Simple</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                Empower your community by reporting civic issues like potholes, garbage disposal problems, and more.
                Track progress with our 72-hour response guarantee.
              </p>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated ? (
                  <Button asChild size="lg">
                    <Link to="/submit">
                      Report an Issue <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg">Get Started</Button>
                )}
              </div>
            </div>
            <div className="relative">
              <img
                src="/assets/generated/civic-hero-illustration.dim_1600x900.png"
                alt="Civic reporting illustration"
                className="w-full rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process ensures your civic issues are addressed promptly and efficiently
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>1. Report</CardTitle>
                <CardDescription>Upload photos and details of civic issues in your area</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>2. 72-Hour Response Window</CardTitle>
                <CardDescription>Officials have 72 hours to address your complaint</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>3. Resolution</CardTitle>
                <CardDescription>Track progress and view before/after photos</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>4. Feedback</CardTitle>
                <CardDescription>Confirm resolution and provide feedback</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Make a Difference?</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of citizens working together to improve their communities
            </p>
            {isAuthenticated ? (
              <Button asChild size="lg">
                <Link to="/submit">
                  Report Your First Issue <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button size="lg">Sign In to Get Started</Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
