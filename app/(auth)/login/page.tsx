import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthSigninForm } from '@/components/auth-signin-form';
import { AuthRedirect } from '@/components/auth-redirect';

export default function LoginPage() {
  return (
    <Card className="border-white/10 bg-white/[0.06] shadow-glass backdrop-blur-xl">
      <AuthRedirect />
      <CardHeader>
        <Badge variant="accent" className="w-fit">
          Sign in
        </Badge>
        <CardTitle>Welcome back</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AuthSigninForm />
        <p className="text-sm text-muted-foreground">
          No account yet? <Link className="text-primary" href="/signup">Create one</Link>
        </p>
      </CardContent>
    </Card>
  );
}
