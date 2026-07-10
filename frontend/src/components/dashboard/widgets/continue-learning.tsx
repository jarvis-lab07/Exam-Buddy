import { ChevronRight, Clock, Play } from "lucide-react";
import { Card, CardHeader } from "@/components/dashboard/card";
import { continueLearning } from "@/components/dashboard/data";

export function ContinueLearning() {
  return (
    <Card>
      <CardHeader
        title="Continue learning"
        action={
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        }
      />
      <div className="flex flex-col gap-2 p-3">
        {continueLearning.map(
          ({ subject, title, icon: Icon, progress, minutesLeft, accent }) => (
            <button
              key={title}
              type="button"
              className="group flex items-center gap-4 rounded-xl border border-transparent p-2.5 text-left transition-colors hover:border-border hover:bg-background/60"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${accent}1f`, color: accent }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{title}</p>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {minutesLeft}m
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{subject}</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${progress}%`, backgroundColor: accent }}
                  />
                </div>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Play className="h-4 w-4" />
              </span>
            </button>
          ),
        )}
      </div>
    </Card>
  );
}
