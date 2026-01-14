import { Suspense } from "react"
import PilotBriefing from "@/components/pilot-briefing"

export default function PilotBriefingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PilotBriefing />
    </Suspense>
  )
}
