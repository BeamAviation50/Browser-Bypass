import { Suspense } from "react"
import { NewsTicker } from "@/components/news-ticker"
import { HeroSection } from "@/components/hero-section"
import { FlightSearch } from "@/components/flight-search"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <NewsTicker />
      <HeroSection />
      <Suspense fallback={null}>
        <FlightSearch />
      </Suspense>
      <Footer />
    </main>
  )
}
