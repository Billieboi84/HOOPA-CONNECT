import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthSignupForm } from '@/components/auth-signup-form';

export default function SignupPage() {
  return (
    <Card className="border-white/10 bg-white/[0.06] shadow-glass backdrop-blur-xl">
      <CardHeader>
        <Badge variant="accent" className="w-fit">
          Create account
        </Badge>
        <CardTitle>Join the community portal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AuthSignupForm />
        <p className="text-sm text-muted-foreground">
          Already registered? <Link className="text-primary" href="/login">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
