import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function ChairmanSection() {
  return (
    <section className="glass-panel overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
        <div className="relative aspect-[4/3] min-h-[280px] bg-black/10">
          <Image
            src="/images/chairman-davis.jpeg"
            alt="Chairman Joe Davis"
            fill
            className="object-contain p-3"
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </div>
        <Card className="rounded-none border-0 bg-transparent shadow-none backdrop-blur-0">
          <CardContent className="space-y-4 p-6 md:p-8">
            <Badge variant="accent" className="w-fit">
              Words from the Chairman
            </Badge>
            <h3 className="text-2xl font-semibold tracking-tight">
              Community progress depends on shared access and steady communication.
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Hoopa Connect is here to keep residents informed, connected, and able to find the resources that
              matter most across the Hoopa Valley.
            </p>
            <div className="text-sm text-muted-foreground">Chairman Joe Davis</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
