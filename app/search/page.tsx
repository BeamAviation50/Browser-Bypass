import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import SearchPageContent from "@/components/search-page-content"

export default function SearchPage() {
  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <SearchPageContent />
      </Suspense>
    </>
  )
}

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="h-32 bg-secondary/30 rounded-lg animate-pulse" />
      </div>
      <Footer />
    </main>
  )
}
