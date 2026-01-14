import { Suspense } from "react"
import BookingPageContent from "@/components/booking-page-content"

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingPageContent />
    </Suspense>
  )
}
