import { Zap, Shield, Clock, Award, Headphones, Plane } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Booking",
    description: "Book your flights in under 60 seconds with our streamlined booking process",
  },
  {
    icon: Shield,
    title: "Flexible Cancellation",
    description: "Plans change. Cancel or modify your booking up to 24 hours before departure",
  },
  {
    icon: Clock,
    title: "On-Time Guarantee",
    description: "We're committed to punctuality with 95% on-time departure rate",
  },
  {
    icon: Award,
    title: "Award-Winning Service",
    description: "Recognized globally for our exceptional in-flight experience",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our dedicated team is always available to assist you",
  },
  {
    icon: Plane,
    title: "Modern Fleet",
    description: "Travel in comfort with our state-of-the-art aircraft",
  },
]

export function Features() {
  return (
    <section id="experience" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why fly with LGT?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the difference with our commitment to excellence in every aspect of your journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
