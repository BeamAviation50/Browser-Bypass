"use client"

import { Button } from "@/components/ui/button"
import { ImageCarousel } from "./image-carousel"

export function HeroSection() {
  const scrollToFlightSearch = () => {
    const flightSearchElement = document.getElementById("flight-search")
    if (flightSearchElement) {
      flightSearchElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-40">
      <div className="absolute inset-0 z-0">
        <ImageCarousel />
        <div className="absolute inset-0 bg-background/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 text-balance">
          Travel at the speed
          <br />
          <span className="text-primary">of lightning</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Experience premium air travel with Lightning Airways. Fast booking, exceptional service, and unforgettable
          journeys to destinations worldwide.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6"
            onClick={scrollToFlightSearch}
          >
            Book a flight
          </Button>
        </div>
      </div>
    </section>
  )
}
