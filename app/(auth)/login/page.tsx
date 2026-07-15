import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  return (
    <Card className="border-white/10 bg-white/6 shadow-glass backdrop-blur-xl">
      <CardHeader>
        <Badge variant="accent" className="w-fit">
          Sign in
        </Badge>
        <CardTitle>Welcome back</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input type="email" placeholder="Email" />
        <Input type="password" placeholder="Password" />
        <Button className="w-full">Sign in</Button>
        <p className="text-sm text-muted-foreground">
          No account yet? <Link className="text-primary" href="/signup">Create one</Link>
        </p>
      </CardContent>
    </Card>
  );
}
