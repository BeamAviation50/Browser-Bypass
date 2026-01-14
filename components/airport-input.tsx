"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { airports, type Airport } from "@/lib/airports"
import { PlaneTakeoff, PlaneLanding } from "lucide-react"
import { cn } from "@/lib/utils"

interface AirportInputProps {
  type: "from" | "to"
  value: string
  onChange: (value: string, airport?: Airport) => void
  placeholder?: string
}

export function AirportInput({ type, value, onChange, placeholder = "City or airport" }: AirportInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value.length > 0) {
      const query = value.toLowerCase()
      const filtered = airports
        .filter(
          (airport) =>
            airport.city.toLowerCase().includes(query) ||
            airport.code.toLowerCase().includes(query) ||
            airport.name.toLowerCase().includes(query) ||
            airport.country.toLowerCase().includes(query),
        )
        .slice(0, 6)
      setFilteredAirports(filtered)
      setIsOpen(filtered.length > 0)
    } else {
      setFilteredAirports([])
      setIsOpen(false)
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (airport: Airport) => {
    onChange(`${airport.city} (${airport.code})`, airport)
    setIsOpen(false)
  }

  const Icon = type === "from" ? PlaneTakeoff : PlaneLanding

  return (
    <div className="relative">
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length > 0 && filteredAirports.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 bg-secondary border-border h-12 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {isOpen && filteredAirports.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
        >
          {filteredAirports.map((airport) => (
            <button
              key={airport.code}
              onClick={() => handleSelect(airport)}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-secondary transition-colors flex items-center gap-3",
                "border-b border-border last:border-b-0",
              )}
            >
              <div className="flex-shrink-0 w-12 h-10 bg-primary/10 rounded flex items-center justify-center">
                <span className="text-primary font-bold text-sm">{airport.code}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-foreground font-medium truncate">{airport.city}</div>
                <div className="text-muted-foreground text-sm truncate">{airport.name}</div>
              </div>
              <div className="text-muted-foreground text-xs">{airport.country}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
