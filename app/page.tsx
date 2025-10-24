import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-black">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_45%)]" />
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3 text-lg font-semibold text-foreground">
          <Sparkles className="h-6 w-6 text-primary" /> RevisionAI
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button asChild variant="outline" className="border-primary/50 text-primary">
            <Link href="/chat">Open app</Link>
          </Button>
        </div>
      </header>
      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-16 text-center md:px-12">
        <div className="flex flex-col items-center gap-6">
          <span className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-sm font-medium tracking-wide text-primary">
            Study smarter with your AI companion
          </span>
          <h1 className="text-balance text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl">
            Conversational revision tailored for deep understanding.
          </h1>
          <p className="max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
            RevisionAI keeps track of your study sessions, trims context intelligently, and helps you capture every insight. Switch
            devices anytime—your conversations persist in your browser.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/chat">
                Launch chat <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Ctrl/Cmd + K to explore commands</p>
          </div>
        </div>
      </section>
      <footer className="flex items-center justify-center px-6 pb-8 text-xs text-muted-foreground md:px-12">
        Built for night owls and early birds alike.
      </footer>
    </main>
  );
}
