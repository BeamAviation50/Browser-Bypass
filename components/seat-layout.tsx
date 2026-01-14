"use client"

import type { Aircraft } from "@/lib/flight-generator"
import { Card } from "@/components/ui/card"

interface SeatLayoutProps {
  aircraft: Aircraft
  selectedSeats: string[]
  onSeatSelect: (seat: string) => void
  cabinClass?: "first" | "economy"
  flightNumber?: string // add flight number to track booked seats per flight
  maxSeats?: number // Add max seats parameter to enforce single selection
}

export function SeatLayout({
  aircraft,
  selectedSeats,
  onSeatSelect,
  cabinClass = "economy",
  flightNumber = "DEFAULT",
  maxSeats = 1, // Default to 1 seat per passenger
}: SeatLayoutProps) {
  const generateSeatId = (row: number, col: number) => {
    const letter = String.fromCharCode(65 + col)
    return `${row + 1}${letter}`
  }

  const firstClassRows = 9 // Rows 1-9 are first class
  const startRow = cabinClass === "first" ? 0 : firstClassRows
  const endRow = cabinClass === "first" ? firstClassRows : aircraft.rows

  const getBookedSeats = () => {
    const stored = localStorage.getItem(`bookedSeats_${flightNumber}`)
    return stored ? new Set(JSON.parse(stored)) : new Set<string>()
  }

  const bookedSeats = getBookedSeats()

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{aircraft.name} - Select Your Seats</h3>
      <div className="mb-3">
        <span className="text-sm font-medium text-foreground">
          {cabinClass === "first" ? "First Class (Rows 1-9)" : "Economy (Rows 10+)"}
        </span>
        <span className="text-xs text-muted-foreground ml-2">
          (Select {maxSeats} seat{maxSeats !== 1 ? "s" : ""})
        </span>
      </div>
      <div className="inline-block border border-border rounded-lg p-4 bg-secondary/30">
        <div className="space-y-2">
          {Array.from({ length: endRow - startRow }).map((_, index) => {
            const rowIndex = startRow + index
            return (
              <div key={rowIndex} className="flex gap-2 items-center justify-center">
                <span className="text-xs text-muted-foreground w-6 text-right">{rowIndex + 1}</span>
                <div className="flex gap-2">
                  {Array.from({ length: aircraft.seatsPerRow }).map((_, colIndex) => {
                    const seatId = generateSeatId(rowIndex, colIndex)
                    const isBooked = bookedSeats.has(seatId)
                    const isSelected = selectedSeats.includes(seatId)

                    return (
                      <button
                        key={seatId}
                        onClick={() => {
                          if (!isBooked && (isSelected || selectedSeats.length < maxSeats)) {
                            onSeatSelect(seatId)
                          }
                        }}
                        disabled={isBooked || (!isSelected && selectedSeats.length >= maxSeats)}
                        className={`w-6 h-6 rounded text-xs font-semibold transition-colors ${
                          isBooked
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : isSelected
                              ? "bg-primary text-primary-foreground"
                              : selectedSeats.length >= maxSeats
                                ? "bg-card border border-border cursor-not-allowed opacity-50"
                                : "bg-card border border-border hover:bg-secondary text-foreground cursor-pointer"
                        }`}
                        title={seatId}
                      >
                        {String.fromCharCode(65 + colIndex)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex gap-4 justify-center text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-card border border-border rounded" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded" />
            <span className="text-muted-foreground">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded" />
            <span className="text-muted-foreground">Booked</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
