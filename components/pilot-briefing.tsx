"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plane } from "lucide-react"
import { useState, useEffect } from "react"

export default function PilotBriefing() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const flightNumber = searchParams.get("flightNumber") || ""
  const departure = searchParams.get("departure") || ""
  const arrival = searchParams.get("arrival") || ""
  const departureTime = searchParams.get("departureTime") || ""
  const arrivalTime = searchParams.get("arrivalTime") || ""
  const departureTimeZone = searchParams.get("departureTimeZone") || ""
  const arrivalTimeZone = searchParams.get("arrivalTimeZone") || ""
  const aircraft = searchParams.get("aircraft") || ""
  const email = searchParams.get("email") || ""
  const total = searchParams.get("total") || ""
  const seats = searchParams.get("seats") || ""

  const [userRole, setUserRole] = useState<"pilot" | "passenger">("pilot")
  const [userName, setUserName] = useState("")
  const [customCallsign, setCustomCallsign] = useState("")
  const [confirmationNumber, setConfirmationNumber] = useState("")

  useEffect(() => {
    let number = ""
    for (let i = 0; i < 16; i++) {
      number += Math.floor(Math.random() * 10)
    }
    setConfirmationNumber(number)
  }, [])

  const handleSubmit = async () => {
    if (!userName.trim()) {
      alert(`Please enter your ${userRole} name`)
      return
    }

    if (!flightNumber || !departure || !arrival || !departureTime || !arrivalTime || !aircraft) {
      alert("Error: Missing flight details. Please go back and try again.")
      return
    }

    const response = await fetch("/api/discord-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pilotName: userRole === "pilot" ? userName : "N/A",
        passengerName: userRole === "passenger" ? userName : "N/A",
        userRole,
        customCallsign: userRole === "pilot" && customCallsign.trim() ? customCallsign.trim() : undefined,
        flightNumber,
        departureTime,
        departureTimeZone: departureTimeZone || "UTC",
        arrivalTime,
        arrivalTimeZone: arrivalTimeZone || "UTC",
        aircraft,
        confirmationNumber,
        departure,
        arrival,
      }),
    })

    if (!response.ok) throw new Error("Failed to send notification")

    alert("Flight briefing confirmed and sent to Discord!")
    setTimeout(() => router.push("/"), 2000)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Flight Briefing</h1>

        <Card className="p-8 space-y-8">
          <div className="border-b border-border pb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Are you a Pilot or Passenger?</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setUserRole("pilot")}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  userRole === "pilot"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                Pilot
              </button>
              <button
                onClick={() => setUserRole("passenger")}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  userRole === "passenger"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                Passenger
              </button>
            </div>
          </div>

          <div className="border-b border-border pb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {userRole === "pilot" ? "Pilot Information" : "Passenger Information"}
            </h2>
            <Input
              type="text"
              placeholder={`Enter your ${userRole === "pilot" ? "pilot" : "passenger"} name`}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="text-lg font-semibold"
            />
            {userRole === "pilot" && (
              <div className="mt-4">
                <label className="text-sm text-muted-foreground mb-2 block">Custom Callsign (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g., LIGHTNING-01, SPEEDBIRD-99"
                  value={customCallsign}
                  onChange={(e) => setCustomCallsign(e.target.value)}
                  className="text-lg"
                />
              </div>
            )}
          </div>

          <div className="border-b border-border pb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Flight Details</h2>

            <div className="flex items-center gap-3 mb-6">
              <Plane className="h-6 w-6 text-primary" />
              <span className="text-3xl font-bold text-primary">{flightNumber}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Departure</div>
                <div className="text-lg font-semibold text-foreground mb-1">{departure}</div>
                <div className="text-2xl font-bold text-primary mb-1">{departureTime}</div>
                <div className="text-sm text-muted-foreground">{departureTimeZone}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Arrival</div>
                <div className="text-lg font-semibold text-foreground mb-1">{arrival}</div>
                <div className="text-2xl font-bold text-primary mb-1">{arrivalTime}</div>
                <div className="text-sm text-muted-foreground">{arrivalTimeZone}</div>
              </div>
            </div>
          </div>

          <div className="border-b border-border pb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Aircraft</h2>
            <Badge variant="secondary" className="text-base py-2 px-4 font-semibold">
              {aircraft}
            </Badge>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Confirmation Number</h2>
            <div className="bg-primary/10 border-2 border-primary rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">CONFIRMATION CODE</div>
              <div className="text-4xl font-mono font-bold text-primary tracking-widest">
                {confirmationNumber.match(/.{1,4}/g)?.join("-")}
              </div>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full py-6 text-lg font-semibold">
            Confirm Flight Briefing
          </Button>
        </Card>
      </div>

      <Footer />
    </main>
  )
}
