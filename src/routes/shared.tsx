import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { AppShell } from "@/components/lunova/AppShell";
import { DemoBadge, GlassCard, PageHero } from "@/components/lunova/ui";

export const Route = createFileRoute("/shared")({
  head: () => ({
    meta: [
      { title: "Shared with me — Draftwink" },
      { name: "description", content: "Projects others share with you appear here." },
      { property: "og:title", content: "Shared with me — Draftwink" },
      { property: "og:description", content: "Collaborate on creations shared with you." },
    ],
  }),
  component: Shared,
});

function Shared() {
  return (
    <AppShell>
      <PageHero
        eyebrow="Collaboration"
        title="Shared with me"
        subtitle="When someone shares a project with you, it will show up here."
      />
      <GlassCard className="flex flex-col items-center gap-4 p-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ice/10 text-ice">
          <Users className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <div>
          <p className="text-lg font-light">Nothing shared yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Cloud sharing isn’t connected yet. Your drafts are currently saved privately in this
            browser, under your account.
          </p>
        </div>
        <DemoBadge>Cloud sharing coming later</DemoBadge>
      </GlassCard>
    </AppShell>
  );
}
