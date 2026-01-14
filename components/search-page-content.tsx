"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { parse } from "date-fns"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FlightCard } from "@/components/flight-card"
import { SeatLayout } from "@/components/seat-layout"
import { getFlights, extractAirportCode, type Flight, type FlightDuration } from "@/lib/flight-generator"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, RefreshCw, Plane, Search } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

function FlightSearchBot({ from, to }: { from: string; to: string }) {
  const [dots, setDots] = useState("")
  const [message, setMessage] = useState("Initializing search")

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 400)

    const messages = [
      "Initializing search",
      "Connecting to flight database",
      `Looking up ${from} → ${to} route`,
      "Calculating accurate flight times",
      "Checking real-time schedules",
      "Generating available flights",
    ]

    let messageIndex = 0
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length
      setMessage(messages[messageIndex])
    }, 1500)

    return () => {
      clearInterval(dotInterval)
      clearInterval(messageInterval)
    }
  }, [from, to])

  return (
    <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/30 border-primary/20">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Plane className="w-10 h-10 text-primary animate-bounce" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Search className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Flight Bot Searching{dots}</h3>
          <p className="text-muted-foreground">{message}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-background rounded-lg border border-border">
            <span className="font-mono font-semibold text-foreground">{from}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <div className="w-8 h-0.5 bg-primary/50" />
            <Plane className="w-4 h-4 text-primary" />
            <div className="w-8 h-0.5 bg-primary/50" />
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" style={{ animationDelay: "0.5s" }} />
          </div>
          <div className="px-4 py-2 bg-background rounded-lg border border-border">
            <span className="font-mono font-semibold text-foreground">{to}</span>
          </div>
        </div>

        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-8 bg-primary/30 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.15}s`, height: `${16 + Math.random() * 16}px` }}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}

export default function SearchPageContent() {
  const searchParams = useSearchParams()
  const tripType = searchParams.get("tripType") || "roundtrip"
  const legsParam = searchParams.get("legs")

  let from = ""
  let to = ""
  let departure = ""
  let returnDate = ""
  let multiCityLegs = null

  if (tripType === "multicity" && legsParam) {
    try {
      multiCityLegs = JSON.parse(legsParam)
    } catch {
      console.error("[v0] Failed to parse multi-city legs")
      multiCityLegs = null
    }
  } else {
    from = searchParams.get("from") || ""
    to = searchParams.get("to") || ""
    departure = searchParams.get("departure") || ""
    returnDate = searchParams.get("return") || ""
  }

  const passengersValue = searchParams.get("passengers") || "1-economy"

  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [selectingReturn, setSelectingReturn] = useState(false)
  const [outboundFlight, setOutboundFlight] = useState<Flight | null>(null)
  const [outboundSeats, setOutboundSeats] = useState<string[]>([])

  const [currentLegIndex, setCurrentLegIndex] = useState(0)
  const [selectedLegs, setSelectedLegs] = useState<Flight[]>([])

  const [refreshCode, setRefreshCode] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [showRefreshInput, setShowRefreshInput] = useState(false)
  const [refreshError, setRefreshError] = useState("")

  const [isSearching, setIsSearching] = useState(true)
  const [flightDuration, setFlightDuration] = useState<FlightDuration | null>(null)
  const [flights, setFlights] = useState<Flight[]>([])

  const [numPassengers, cabinClass] = passengersValue.split("-")
  const passengers = Number.parseInt(numPassengers) || 1

  useEffect(() => {
    async function fetchFlightDuration() {
      setIsSearching(true)
      setFlights([])

      const currentFrom = selectingReturn ? to : from
      const currentTo = selectingReturn ? from : to

      if (!currentFrom || !currentTo) {
        setIsSearching(false)
        return
      }

      const fromCode = extractAirportCode(currentFrom)
      const toCode = extractAirportCode(currentTo)

      try {
        // Simulate bot search time for UX (minimum 2 seconds)
        const startTime = Date.now()

        const response = await fetch(`/api/flight-duration?from=${fromCode}&to=${toCode}`)
        const data = await response.json()

        const elapsed = Date.now() - startTime
        const remainingDelay = Math.max(0, 2000 - elapsed)

        await new Promise((resolve) => setTimeout(resolve, remainingDelay))

        if (data.minMinutes && data.maxMinutes) {
          setFlightDuration({
            minMinutes: data.minMinutes,
            maxMinutes: data.maxMinutes,
          })

          const currentDate =
            selectingReturn && returnDate
              ? parse(returnDate, "yyyy-MM-dd", new Date())
              : parse(departure, "yyyy-MM-dd", new Date())

          const generatedFlights = getFlights(
            currentFrom,
            currentTo,
            currentDate,
            passengers,
            cabinClass as "first" | "economy",
            refreshKey,
            { minMinutes: data.minMinutes, maxMinutes: data.maxMinutes },
          )

          setFlights(generatedFlights)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch flight duration:", error)
        // Fallback to generating flights without dynamic duration
        const currentDate =
          selectingReturn && returnDate
            ? parse(returnDate, "yyyy-MM-dd", new Date())
            : parse(departure, "yyyy-MM-dd", new Date())

        const generatedFlights = getFlights(
          currentFrom,
          currentTo,
          currentDate,
          passengers,
          cabinClass as "first" | "economy",
          refreshKey,
        )
        setFlights(generatedFlights)
      } finally {
        setIsSearching(false)
      }
    }

    fetchFlightDuration()
  }, [from, to, departure, returnDate, selectingReturn, passengers, cabinClass, refreshKey])

  // Multi-city handling with dynamic duration
  if (multiCityLegs && multiCityLegs.length > 0) {
    const currentLeg = multiCityLegs[currentLegIndex]

    return (
      <main className="min-h-screen bg-background">
        <Header />

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Multi-City Progress */}
          <div className="mb-8">
            <Link href="/#book" className="flex items-center gap-2 text-primary hover:underline mb-4">
              <ArrowLeft className="h-4 w-4" />
              Modify search
            </Link>

            <Card className="p-6 bg-secondary/50">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Your Multi-City Trip</h1>

              <div className="space-y-3 mb-4">
                {multiCityLegs.map((leg: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      index === currentLegIndex
                        ? "bg-primary/10 border-primary/40"
                        : "bg-background/50 border-border/40"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">
                        {extractAirportCode(leg.from)} → {extractAirportCode(leg.to)}
                      </div>
                      <div className="text-sm text-muted-foreground">{leg.date}</div>
                    </div>
                    {index < currentLegIndex ? (
                      <Badge variant="default" className="bg-green-600">
                        ✓ Selected
                      </Badge>
                    ) : index === currentLegIndex ? (
                      <Badge variant="default" className="bg-primary">
                        Current
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Flight Selection with Bot Search */}
          <MultiCityFlightSearch
            leg={currentLeg}
            legIndex={currentLegIndex}
            totalLegs={multiCityLegs.length}
            passengers={passengers}
            cabinClass={cabinClass}
            refreshKey={refreshKey}
            selectedLegs={selectedLegs}
            setSelectedLegs={setSelectedLegs}
            onPrevious={() => setCurrentLegIndex((prev) => prev - 1)}
            onNext={() => setCurrentLegIndex((prev) => prev + 1)}
            onComplete={() => {
              const bookingParams = new URLSearchParams({
                tripType: "multicity",
                passengers: passengers.toString(),
                legs: JSON.stringify(
                  selectedLegs.map((f) => ({
                    flightNumber: f.flightNumber,
                    departure: f.departure.airport,
                    arrival: f.arrival.airport,
                    departureTime: f.departure.time,
                    arrivalTime: f.arrival.time,
                  })),
                ),
              })
              window.location.href = `/booking?${bookingParams.toString()}`
            }}
          />
        </div>

        <Footer />
      </main>
    )
  }

  const handleSeatSelect = (seat: string) => {
    setSelectedSeats((prev) => (prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]))
  }

  const handleContinue = () => {
    if (!selectedFlight) return

    if (tripType === "roundtrip" && !selectingReturn && returnDate) {
      setOutboundFlight(selectedFlight)
      setOutboundSeats(selectedSeats)
      setSelectedFlight(null)
      setSelectedSeats([])
      setSelectingReturn(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    const bookingParams = new URLSearchParams({
      flightNumber: selectedFlight.flightNumber,
      departure: selectedFlight.departure.airport,
      arrival: selectedFlight.arrival.airport,
      departureTime: selectedFlight.departure.time,
      arrivalTime: selectedFlight.arrival.time,
      departureTimeZone: selectedFlight.departure.timeZone,
      arrivalTimeZone: selectedFlight.arrival.timeZone,
      price: selectedFlight.price.toString(),
      seats: selectedSeats.join(","),
      aircraft: selectedFlight.aircraft.name,
      tripType,
      passengers: passengers.toString(),
    })

    if (outboundFlight && selectingReturn) {
      bookingParams.set("returnFlightNumber", outboundFlight.flightNumber)
      bookingParams.set("returnDeparture", outboundFlight.departure.airport)
      bookingParams.set("returnArrival", outboundFlight.arrival.airport)
      bookingParams.set("returnDepartureTime", outboundFlight.departure.time)
      bookingParams.set("returnArrivalTime", outboundFlight.arrival.time)
      bookingParams.set("returnDepartureTimeZone", outboundFlight.departure.timeZone)
      bookingParams.set("returnArrivalTimeZone", outboundFlight.arrival.timeZone)
      bookingParams.set("returnPrice", outboundFlight.price.toString())
      bookingParams.set("returnSeats", outboundSeats.join(","))
      bookingParams.set("returnAircraft", outboundFlight.aircraft.name)
      bookingParams.set("price", ((selectedFlight.price + outboundFlight.price) * passengers).toString())
    }

    window.location.href = `/booking?${bookingParams.toString()}`
  }

  const handleRefresh = () => {
    if (refreshCode === "0912") {
      setRefreshKey((prev) => prev + 1)
      setRefreshCode("")
      setShowRefreshInput(false)
      setRefreshError("")
    } else {
      setRefreshError("Invalid code")
    }
  }

  const currentFromDisplay = selectingReturn ? to : from
  const currentToDisplay = selectingReturn ? from : to

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search Summary */}
        <div className="mb-8">
          <Link href="/#book" className="flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            Modify search
          </Link>

          <Card className="p-6 bg-secondary/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {selectingReturn ? (
                    <>
                      <Badge variant="outline" className="mr-2">
                        Return Flight
                      </Badge>
                      {extractAirportCode(to)} → {extractAirportCode(from)}
                    </>
                  ) : (
                    <>
                      {tripType === "roundtrip" && (
                        <Badge variant="outline" className="mr-2">
                          Outbound Flight
                        </Badge>
                      )}
                      {extractAirportCode(from)} → {extractAirportCode(to)}
                    </>
                  )}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{selectingReturn ? returnDate : departure}</Badge>
                  <Badge variant="outline">
                    {passengers} {passengers === 1 ? "passenger" : "passengers"}
                  </Badge>
                  {flightDuration && (
                    <Badge variant="outline" className="bg-primary/10">
                      ~{Math.floor((flightDuration.minMinutes + flightDuration.maxMinutes) / 2 / 60)}h{" "}
                      {Math.round(((flightDuration.minMinutes + flightDuration.maxMinutes) / 2) % 60)}m flight
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-sm text-muted-foreground">{flights.length} flights found</div>
                {showRefreshInput ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="password"
                      placeholder="Enter code"
                      value={refreshCode}
                      onChange={(e) => {
                        setRefreshCode(e.target.value)
                        setRefreshError("")
                      }}
                      className="w-28 h-9"
                      onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
                    />
                    <Button size="sm" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowRefreshInput(false)
                        setRefreshCode("")
                        setRefreshError("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => setShowRefreshInput(true)} className="mt-2">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Flights
                  </Button>
                )}
                {refreshError && <p className="text-sm text-red-500">{refreshError}</p>}
              </div>
            </div>
          </Card>

          {selectingReturn && outboundFlight && (
            <Card className="p-4 bg-primary/5 border-primary/20 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Selected Outbound Flight</div>
                  <div className="font-semibold text-foreground">
                    {outboundFlight.flightNumber} - {outboundFlight.departure.time} → {outboundFlight.arrival.time}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectingReturn(false)
                    setSelectedFlight(outboundFlight)
                    setSelectedSeats(outboundSeats)
                    setOutboundFlight(null)
                    setOutboundSeats([])
                  }}
                >
                  Change
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flights List */}
          <div className="lg:col-span-2 space-y-4">
            {isSearching ? (
              <FlightSearchBot
                from={extractAirportCode(currentFromDisplay)}
                to={extractAirportCode(currentToDisplay)}
              />
            ) : flights.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No flights found for your search criteria.</p>
              </Card>
            ) : (
              flights.map((flight) => (
                <div key={flight.id}>
                  <FlightCard flight={flight} passengers={passengers} onSelect={setSelectedFlight} />
                </div>
              ))
            )}
          </div>

          {/* Seat Selection & Summary */}
          <div className="space-y-6">
            {selectedFlight ? (
              <>
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <h3 className="font-semibold text-foreground mb-2">Selected Flight</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Flight: </span>
                      <span className="font-semibold text-foreground">{selectedFlight.flightNumber}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Departure: </span>
                      <span className="font-semibold text-foreground">
                        {selectedFlight.departure.time} {selectedFlight.departure.timeZone}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Arrival: </span>
                      <span className="font-semibold text-foreground">
                        {selectedFlight.arrival.time} {selectedFlight.arrival.timeZone}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration: </span>
                      <span className="font-semibold text-foreground">{selectedFlight.duration}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price: </span>
                      <span className="font-semibold text-foreground">${selectedFlight.price * passengers}</span>
                    </div>
                  </div>
                </Card>

                <SeatLayout
                  aircraft={selectedFlight.aircraft}
                  selectedSeats={selectedSeats}
                  onSeatSelect={handleSeatSelect}
                  cabinClass={cabinClass as "first" | "economy"}
                />

                <Card className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">Selected Seats</h3>
                  <div className="text-sm">
                    {selectedSeats.length === 0 ? (
                      <p className="text-muted-foreground">No seats selected</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {selectedSeats.map((seat) => (
                            <Badge key={seat} className="bg-primary text-primary-foreground">
                              {seat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                <Button
                  onClick={handleContinue}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  {tripType === "roundtrip" && !selectingReturn && returnDate ? (
                    <>
                      Select Return Flight
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    "Continue to Booking"
                  )}
                </Button>
              </>
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                <p>Select a flight to view seat layout and complete your booking</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

function MultiCityFlightSearch({
  leg,
  legIndex,
  totalLegs,
  passengers,
  cabinClass,
  refreshKey,
  selectedLegs,
  setSelectedLegs,
  onPrevious,
  onNext,
  onComplete,
}: {
  leg: { from: string; to: string; date: string }
  legIndex: number
  totalLegs: number
  passengers: number
  cabinClass: string
  refreshKey: number
  selectedLegs: Flight[]
  setSelectedLegs: React.Dispatch<React.SetStateAction<Flight[]>>
  onPrevious: () => void
  onNext: () => void
  onComplete: () => void
}) {
  const [isSearching, setIsSearching] = useState(true)
  const [flights, setFlights] = useState<Flight[]>([])

  useEffect(() => {
    async function fetchFlights() {
      setIsSearching(true)
      setFlights([])

      const fromCode = extractAirportCode(leg.from)
      const toCode = extractAirportCode(leg.to)

      try {
        const startTime = Date.now()

        const response = await fetch(`/api/flight-duration?from=${fromCode}&to=${toCode}`)
        const data = await response.json()

        const elapsed = Date.now() - startTime
        const remainingDelay = Math.max(0, 2000 - elapsed)
        await new Promise((resolve) => setTimeout(resolve, remainingDelay))

        const currentDate = parse(leg.date, "yyyy-MM-dd", new Date())

        const generatedFlights = getFlights(
          leg.from,
          leg.to,
          currentDate,
          passengers,
          cabinClass as "first" | "economy",
          refreshKey,
          data.minMinutes && data.maxMinutes ? { minMinutes: data.minMinutes, maxMinutes: data.maxMinutes } : undefined,
        )

        setFlights(generatedFlights)
      } catch (error) {
        console.error("[v0] Failed to fetch flight duration:", error)
      } finally {
        setIsSearching(false)
      }
    }

    fetchFlights()
  }, [leg, passengers, cabinClass, refreshKey])

  return (
    <>
      <div className="space-y-4">
        {isSearching ? (
          <FlightSearchBot from={extractAirportCode(leg.from)} to={extractAirportCode(leg.to)} />
        ) : flights.length > 0 ? (
          flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              isSelected={selectedLegs.some(
                (f) => f.flightNumber === flight.flightNumber && f.departure.time === flight.departure.time,
              )}
              onSelect={() => {
                setSelectedLegs((prev) => {
                  const existing = prev.findIndex(
                    (f) => f.flightNumber === flight.flightNumber && f.departure.time === flight.departure.time,
                  )
                  if (existing >= 0) {
                    return prev.filter((_, i) => i !== existing)
                  }
                  return [...prev, flight]
                })
              }}
            />
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No flights found for this route</p>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={legIndex === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous leg
        </Button>

        {legIndex < totalLegs - 1 ? (
          <Button onClick={onNext} disabled={selectedLegs.length <= legIndex}>
            Next leg
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={onComplete} disabled={selectedLegs.length === 0}>
            Continue to booking
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  )
}
