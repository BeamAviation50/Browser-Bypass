import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section id="loyalty" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url('/abstract-lightning-bolt-pattern-electric-yellow-on.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative z-10 p-8 md:p-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Join Lightning Rewards and earn
              <br />
              <span className="text-primary">miles on every flight</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Unlock exclusive benefits, priority boarding, lounge access, and more. Start earning rewards from your
              very first flight.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Join Lightning Rewards
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-secondary bg-transparent"
              >
                Learn more
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
