"use client"

import type { Flight } from "@/lib/flight-generator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Clock, Zap, Plane } from "lucide-react"
import { useState } from "react"

interface FlightCardProps {
  flight: Flight
  passengers: number
  onSelect: (flight: Flight) => void
}

export function FlightCard({ flight, passengers, onSelect }: FlightCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const isConnecting = flight.stops > 0 && flight.connectingFlights && flight.connectingFlights.length > 0

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect(flight)}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Flight Time */}
        <div className="md:col-span-3">
          <div className="text-center md:text-left">
            <div className="text-2xl md:text-3xl font-bold text-foreground">{flight.departure.time}</div>
            <div className="text-sm text-muted-foreground">
              {flight.departure.airport} {flight.departure.timeZone}
            </div>
          </div>
        </div>

        {/* Duration & Route */}
        <div className="md:col-span-3">
          <div className="flex items-center gap-2 justify-center">
            <div className="flex-1 h-1 bg-border rounded-full" />
            <div className="text-xs text-muted-foreground font-medium text-center px-2">
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                {flight.duration}
              </div>
              {flight.stops === 0 ? (
                <div className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">Nonstop</div>
              ) : (
                <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  <span className="font-semibold">{flight.stops} stop</span>
                  {flight.layoverAirport && (
                    <span className="block text-muted-foreground">
                      {flight.layoverDuration} in {flight.layoverAirport}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 h-1 bg-border rounded-full" />
          </div>
        </div>

        {/* Arrival Time */}
        <div className="md:col-span-3">
          <div className="text-center md:text-right">
            <div className="text-2xl md:text-3xl font-bold text-foreground">{flight.arrival.time}</div>
            <div className="text-sm text-muted-foreground">
              {flight.arrival.airport} {flight.arrival.timeZone}
            </div>
          </div>
        </div>

        {/* Price & Action */}
        <div className="md:col-span-3 flex flex-col items-center gap-3">
          <div>
            <div className="text-2xl font-bold text-primary">${flight.price}</div>
            <div className="text-xs text-muted-foreground text-center">per passenger</div>
          </div>
          <Button
            size="sm"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(flight)
            }}
          >
            Select
          </Button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs font-mono">
            {flight.flightNumber}
          </Badge>
          <div className="flex items-center gap-2">
            {isConnecting && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDetails(!showDetails)
                }}
              >
                {showDetails ? "Hide details" : "Show details"}
              </Button>
            )}
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              {flight.aircraft.name}
            </Badge>
          </div>
        </div>
      </div>

      {isConnecting && showDetails && flight.connectingFlights && (
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          <div className="text-sm font-semibold text-foreground">Flight Details</div>
          {flight.connectingFlights.map((leg, index) => (
            <div key={leg.flightNumber} className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Plane className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm font-semibold">{leg.flightNumber}</span>
                <Badge variant="outline" className="text-xs ml-auto">
                  {leg.aircraft.name}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-foreground">{leg.departure.time}</div>
                  <div className="text-muted-foreground text-xs">
                    {leg.departure.airport} {leg.departure.timeZone}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground">{leg.duration}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">{leg.arrival.time}</div>
                  <div className="text-muted-foreground text-xs">
                    {leg.arrival.airport} {leg.arrival.timeZone}
                  </div>
                </div>
              </div>
              {/* Show layover info after first leg */}
              {index === 0 && flight.layoverDuration && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      {flight.layoverDuration} layover in {flight.layoverAirport}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
