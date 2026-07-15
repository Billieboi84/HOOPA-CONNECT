import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
