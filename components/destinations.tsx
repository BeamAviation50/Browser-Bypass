import Image from "next/image"
import { ArrowRight } from "lucide-react"

const destinations = [
  {
    city: "Tokyo",
    country: "Japan",
    price: "From $899",
    image: "/tokyo-skyline-at-night-with-neon-lights-and-tokyo-.jpg",
  },
  {
    city: "Paris",
    country: "France",
    price: "From $649",
    image: "/paris-eiffel-tower-at-sunset-golden-hour.jpg",
  },
  {
    city: "New York",
    country: "USA",
    price: "From $399",
    image: "/new-york-city-skyline-manhattan-at-dusk.jpg",
  },
  {
    city: "Dubai",
    country: "UAE",
    price: "From $749",
    image: "/dubai-skyline-burj-khalifa-at-night.jpg",
  },
  {
    city: "Sydney",
    country: "Australia",
    price: "From $1,199",
    image: "/sydney-opera-house-and-harbour-bridge-at-sunset.jpg",
  },
]

export function Destinations() {
  return (
    <section id="destinations" className="py-20 px-6 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Popular destinations</h2>
            <p className="text-muted-foreground max-w-xl">Discover our most sought-after routes with exclusive fares</p>
          </div>
          <a href="#" className="text-primary flex items-center gap-2 hover:gap-3 transition-all mt-4 md:mt-0">
            View all destinations
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <div
              key={destination.city}
              className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={destination.image || "/placeholder.svg"}
                  alt={`${destination.city}, ${destination.country}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{destination.city}</h3>
                    <p className="text-muted-foreground text-sm">{destination.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-semibold">{destination.price}</p>
                    <p className="text-muted-foreground text-xs">round trip</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
