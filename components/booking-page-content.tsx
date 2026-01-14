"use client"

import type React from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plane, Minus, Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { SeatLayout } from "@/components/seat-layout"

const BAGGAGE_OPTIONS = [
  { id: "carry-on", name: "Carry-On Bag", price: 0, description: "1 personal item included (free)" },
  { id: "checked-bag-1", name: "First Checked Bag", price: 35, description: "Up to 50 lbs" },
  { id: "checked-bag-2", name: "Second Checked Bag", price: 45, description: "Up to 50 lbs" },
  { id: "checked-bag-extra", name: "Additional Checked Bag", price: 150, description: "Up to 50 lbs" },
]

export default function BookingPageContent() {
  const searchParams = useSearchParams()

  const legsParam = searchParams.get("legs")
  let legs: Array<{
    flightNumber: string
    departure: string
    arrival: string
    departureTime: string
    arrivalTime: string
    departureTimeZone: string
    arrivalTimeZone: string
    aircraft: string
    seats: string
  }> = []

  if (legsParam) {
    try {
      legs = JSON.parse(decodeURIComponent(legsParam))
    } catch (e) {
      console.error("Failed to parse legs:", e)
    }
  }

  const flightNumber = searchParams.get("flightNumber") || ""
  const departure = searchParams.get("departure") || ""
  const arrival = searchParams.get("arrival") || ""
  const departureTime = searchParams.get("departureTime") || ""
  const arrivalTime = searchParams.get("arrivalTime") || ""
  const departureTimeZone = searchParams.get("departureTimeZone") || ""
  const arrivalTimeZone = searchParams.get("arrivalTimeZone") || ""
  const price = searchParams.get("price") || "0"
  const seats = searchParams.get("seats") || ""
  const aircraft = searchParams.get("aircraft") || ""
  const tripType = searchParams.get("tripType") || "oneway"
  const returnFlightNumber = searchParams.get("returnFlightNumber") || ""
  const returnDeparture = searchParams.get("returnDeparture") || ""
  const returnArrival = searchParams.get("returnArrival") || ""
  const returnDepartureTime = searchParams.get("returnDepartureTime") || ""
  const returnArrivalTime = searchParams.get("returnArrivalTime") || ""
  const returnDepartureTimeZone = searchParams.get("returnDepartureTimeZone") || ""
  const returnArrivalTimeZone = searchParams.get("returnArrivalTimeZone") || ""
  const returnSeats = searchParams.get("returnSeats") || ""
  const returnAircraft = searchParams.get("returnAircraft") || ""
  const passengers = searchParams.get("passengers") || "1"

  const [formData, setFormData] = useState({
    email: "",
  })

  const [baggageQuantities, setBaggageQuantities] = useState({
    "carry-on": 1,
    "checked-bag-1": 0,
    "checked-bag-2": 0,
    "checked-bag-extra": 0,
  })

  const [multiCitySeatSelections, setMultiCitySeatSelections] = useState<Record<number, string[]>>({})
  const [selectedCabinClass, setSelectedCabinClass] = useState<"first" | "economy">("economy")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const updateBaggageQuantity = (id: string, delta: number) => {
    setBaggageQuantities((prev) => {
      const newQty = Math.max(0, Math.min(5, prev[id] + delta))
      // Carry-on must be at least 1
      if (id === "carry-on" && newQty < 1) return prev
      return { ...prev, [id]: newQty }
    })
  }

  const handleMultiCitySeatSelect = (legIndex: number, seat: string) => {
    setMultiCitySeatSelections((prev) => {
      const legSeats = prev[legIndex] || []
      const seatIndex = legSeats.indexOf(seat)
      if (seatIndex > -1) {
        return { ...prev, [legIndex]: legSeats.filter((_, i) => i !== seatIndex) }
      } else {
        return { ...prev, [legIndex]: [seat] }
      }
    })
  }

  const calculateTotal = () => {
    let totalFlightPrice = 0

    if (legs.length > 0) {
      // Multi-city: sum all leg prices
      const legPrices = searchParams.get("legPrices")
      if (legPrices) {
        try {
          const prices = JSON.parse(decodeURIComponent(legPrices))
          totalFlightPrice = prices.reduce((sum: number, p: number) => sum + p, 0)
        } catch (e) {
          totalFlightPrice = 0
        }
      }
    } else {
      // Single trip or roundtrip
      totalFlightPrice = Number.parseFloat(price)
      if (tripType === "roundtrip" && returnFlightNumber) {
        totalFlightPrice *= 2
      }
    }

    let baggageTotal = 0
    BAGGAGE_OPTIONS.forEach((option) => {
      const qty = baggageQuantities[option.id]
      baggageTotal += option.price * qty
    })

    return totalFlightPrice * Number(passengers) + baggageTotal
  }

  const handleBooking = async () => {
    if (!formData.email) {
      alert("Please enter your email address")
      return
    }

    try {
      const confirmationNumber = Math.floor(Math.random() * 10000000000000000)
        .toString()
        .padStart(16, "0")

      // Build multi-city seat data
      const multiCitySeatData = legs.map((leg, index) => ({
        leg: index + 1,
        flight: leg.flightNumber,
        seats: multiCitySeatSelections[index] || [],
      }))

      const discordFlightNumber = legs.length > 0 ? legs[0].flightNumber : flightNumber
      const discordDeparture = legs.length > 0 ? legs[0].departure : departure
      const discordArrival = legs.length > 0 ? legs[0].arrival : arrival
      const discordDepartureTime = legs.length > 0 ? legs[0].departureTime : departureTime
      const discordArrivalTime = legs.length > 0 ? legs[0].arrivalTime : arrivalTime
      const discordDepartureTimeZone = legs.length > 0 ? legs[0].departureTimeZone : departureTimeZone
      const discordArrivalTimeZone = legs.length > 0 ? legs[0].arrivalTimeZone : arrivalTimeZone
      const discordAircraft = legs.length > 0 ? legs[0].aircraft : aircraft

      const bookingPayload = {
        email: formData.email,
        flightNumber: discordFlightNumber,
        seats: legs.length > 0 ? (multiCitySeatSelections[0] || []).join(",") : seats,
        total: calculateTotal(),
        departure: discordDeparture,
        arrival: discordArrival,
        departureTime: discordDepartureTime,
        arrivalTime: discordArrivalTime,
        departureTimeZone: discordDepartureTimeZone,
        arrivalTimeZone: discordArrivalTimeZone,
        aircraft: discordAircraft,
        confirmationNumber: confirmationNumber,
        passengers,
        legs: legs.length > 0 ? legs : null,
        multiCitySeatData: multiCitySeatData.length > 0 ? multiCitySeatData : null,
      }

      const discordResponse = await fetch("/api/discord-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      })

      if (!discordResponse.ok) {
        const errorData = await discordResponse.json()
        console.error("[v0] Discord notification failed:", errorData)
        alert("Booking failed. Please try again.")
        return
      }

      alert(
        `Hello, thank you for booking your flight for Lightning Airways. A confirmation message has been posted in our Discord community!`,
      )

      // Redirect to pilot briefing page
      const params = new URLSearchParams({
        flightNumber: discordFlightNumber,
        departure: discordDeparture,
        arrival: discordArrival,
        departureTime: discordDepartureTime,
        arrivalTime: discordArrivalTime,
        departureTimeZone: discordDepartureTimeZone,
        arrivalTimeZone: discordArrivalTimeZone,
        aircraft: discordAircraft,
        email: formData.email,
        confirmationNumber: confirmationNumber,
      })

      window.location.href = `/pilot-briefing?${params.toString()}`
    } catch (error) {
      console.error("[v0] Booking error:", error)
      alert("Booking failed. Please try again.")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/search" className="flex items-center gap-2 text-primary hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to flights
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Your Email</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Seat Selection */}
            {legs.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Seat Selection</h2>
                <div className="space-y-6">
                  {legs.map((leg, index) => (
                    <div key={index}>
                      {index > 0 && <div className="border-t border-border pt-6" />}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          Leg {index + 1}: {leg.departure} → {leg.arrival}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {leg.aircraft} • {leg.departureTime} {leg.departureTimeZone}
                        </p>
                      </div>
                      <div className="mb-4">
                        <Label className="text-sm font-medium">Cabin Class</Label>
                        <div className="flex gap-4 mt-2">
                          <button
                            onClick={() => setSelectedCabinClass("economy")}
                            className={`px-4 py-2 rounded border transition-colors ${
                              selectedCabinClass === "economy"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border hover:bg-secondary"
                            }`}
                          >
                            Economy
                          </button>
                          <button
                            onClick={() => setSelectedCabinClass("first")}
                            className={`px-4 py-2 rounded border transition-colors ${
                              selectedCabinClass === "first"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border hover:bg-secondary"
                            }`}
                          >
                            First Class
                          </button>
                        </div>
                      </div>
                      {/* Seat Layout */}
                      <SeatLayout
                        aircraft={{
                          name: leg.aircraft,
                          rows: 30,
                          seatsPerRow: 6,
                        }}
                        selectedSeats={multiCitySeatSelections[index] || []}
                        onSeatSelect={(seat) => handleMultiCitySeatSelect(index, seat)}
                        cabinClass={selectedCabinClass}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Baggage Options */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Baggage Options</h2>
              <div className="space-y-4">
                {BAGGAGE_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{option.name}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                      <div className="text-sm font-semibold text-primary mt-1">
                        {option.price === 0 ? "Included" : `$${option.price} each`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateBaggageQuantity(option.id, -1)}
                        disabled={option.id === "carry-on" && baggageQuantities[option.id] <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{baggageQuantities[option.id]}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateBaggageQuantity(option.id, 1)}
                        disabled={baggageQuantities[option.id] >= 5}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Flight Summary</h2>
              <div className="space-y-4">
                {legs.length > 0 ? (
                  legs.map((leg, index) => (
                    <div key={index}>
                      {index > 0 && <div className="border-t border-border pt-4 mt-4" />}
                      {legs.length > 1 && (
                        <Badge variant="secondary" className="mb-2">
                          Leg {index + 1}
                        </Badge>
                      )}
                      <div className="flex items-center gap-2 text-primary mb-3">
                        <Plane className="h-5 w-5" />
                        <span className="font-semibold">{leg.flightNumber}</span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">From</div>
                          <div className="font-semibold text-foreground">{leg.departure}</div>
                          <div className="text-muted-foreground">
                            {leg.departureTime} {leg.departureTimeZone}
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground">To</div>
                          <div className="font-semibold text-foreground">{leg.arrival}</div>
                          <div className="text-muted-foreground">
                            {leg.arrivalTime} {leg.arrivalTimeZone}
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground">Aircraft</div>
                          <div className="font-semibold text-foreground">{leg.aircraft}</div>
                        </div>

                        {leg.seats && (
                          <div>
                            <div className="text-muted-foreground">Selected Seats</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {leg.seats.split(",").map((seat) => (
                                <Badge key={seat} variant="secondary">
                                  {seat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div>
                      {tripType === "roundtrip" && (
                        <Badge variant="secondary" className="mb-2">
                          Outbound
                        </Badge>
                      )}
                      <div className="flex items-center gap-2 text-primary mb-3">
                        <Plane className="h-5 w-5" />
                        <span className="font-semibold">{flightNumber}</span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">From</div>
                          <div className="font-semibold text-foreground">{departure}</div>
                          <div className="text-muted-foreground">
                            {departureTime} {departureTimeZone}
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground">To</div>
                          <div className="font-semibold text-foreground">{arrival}</div>
                          <div className="text-muted-foreground">
                            {arrivalTime} {arrivalTimeZone}
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground">Aircraft</div>
                          <div className="font-semibold text-foreground">{aircraft}</div>
                        </div>

                        {seats && (
                          <div>
                            <div className="text-muted-foreground">Selected Seats</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {seats.split(",").map((seat) => (
                                <Badge key={seat} variant="secondary">
                                  {seat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {tripType === "roundtrip" && returnFlightNumber && (
                      <div className="border-t border-border pt-4">
                        <Badge variant="secondary" className="mb-2">
                          Return
                        </Badge>
                        <div className="flex items-center gap-2 text-primary mb-3">
                          <Plane className="h-5 w-5" />
                          <span className="font-semibold">{returnFlightNumber}</span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <div className="text-muted-foreground">From</div>
                            <div className="font-semibold text-foreground">{returnDeparture}</div>
                            <div className="text-muted-foreground">
                              {returnDepartureTime} {returnDepartureTimeZone}
                            </div>
                          </div>

                          <div>
                            <div className="text-muted-foreground">To</div>
                            <div className="font-semibold text-foreground">{returnArrival}</div>
                            <div className="text-muted-foreground">
                              {returnArrivalTime} {returnArrivalTimeZone}
                            </div>
                          </div>

                          <div>
                            <div className="text-muted-foreground">Aircraft</div>
                            <div className="font-semibold text-foreground">{returnAircraft}</div>
                          </div>

                          {returnSeats && (
                            <div>
                              <div className="text-muted-foreground">Selected Seats</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {returnSeats.split(",").map((seat) => (
                                  <Badge key={seat} variant="secondary">
                                    {seat}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="border-t border-border pt-4 space-y-2">
                  {/* Flight Price */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {legs.length > 0 ? "Total Flight Price" : "Flight Price"}
                    </span>
                    <span className="font-semibold">
                      $
                      {legs.length > 0
                        ? (() => {
                            const legPrices = searchParams.get("legPrices")
                            if (legPrices) {
                              try {
                                const prices = JSON.parse(decodeURIComponent(legPrices))
                                return (
                                  prices.reduce((sum: number, p: number) => sum + p, 0) * Number(passengers)
                                ).toFixed(2)
                              } catch (e) {
                                return "0"
                              }
                            }
                            return "0"
                          })()
                        : (Number.parseFloat(price) * Number(passengers)).toFixed(2)}
                    </span>
                  </div>

                  {/* Number of Passengers */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Number of Passengers</span>
                    <span className="font-semibold">{passengers}</span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Button onClick={handleBooking} className="w-full bg-primary text-primary-foreground" size="lg">
              Confirm Booking
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
