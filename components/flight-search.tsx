"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Users, ArrowRightLeft, Search, Plus, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { AirportInput } from "@/components/airport-input"

interface MultiCityLeg {
  from: string
  to: string
  date: Date | undefined
}

export function FlightSearch() {
  const [departureDate, setDepartureDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [tripType, setTripType] = useState("roundtrip")
  const [fromAirport, setFromAirport] = useState("")
  const [toAirport, setToAirport] = useState("")
  const [passengers, setPassengers] = useState("1-economy")

  const [multiCityLegs, setMultiCityLegs] = useState<MultiCityLeg[]>([
    { from: "", to: "", date: undefined },
    { from: "", to: "", date: undefined },
  ])

  const swapAirports = () => {
    const temp = fromAirport
    setFromAirport(toAirport)
    setToAirport(temp)
  }

  const updateMultiCityLeg = (index: number, field: keyof MultiCityLeg, value: string | Date | undefined) => {
    setMultiCityLegs((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      // Auto-fill next leg's from with this leg's to
      if (field === "to" && index < prev.length - 1) {
        updated[index + 1] = { ...updated[index + 1], from: value as string }
      }
      return updated
    })
  }

  const addMultiCityLeg = () => {
    if (multiCityLegs.length < 5) {
      const lastLeg = multiCityLegs[multiCityLegs.length - 1]
      setMultiCityLegs((prev) => [...prev, { from: lastLeg.to, to: "", date: undefined }])
    }
  }

  const removeMultiCityLeg = (index: number) => {
    if (multiCityLegs.length > 2) {
      setMultiCityLegs((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleSearchFlights = () => {
    if (tripType === "multicity") {
      // Validate multi-city legs
      const invalidLeg = multiCityLegs.find((leg) => !leg.from || !leg.to || !leg.date)
      if (invalidLeg) {
        alert("Please fill in all fields for each flight leg")
        return
      }

      const searchParams = new URLSearchParams({
        tripType: "multicity",
        passengers,
        legs: JSON.stringify(
          multiCityLegs.map((leg) => ({
            from: leg.from,
            to: leg.to,
            date: leg.date ? format(leg.date, "yyyy-MM-dd") : "",
          })),
        ),
      })

      window.location.href = `/search?${searchParams.toString()}`
      return
    }

    if (!fromAirport || !toAirport || !departureDate) {
      alert("Please fill in all required fields")
      return
    }

    const searchParams = new URLSearchParams({
      from: fromAirport,
      to: toAirport,
      departure: format(departureDate, "yyyy-MM-dd"),
      ...(returnDate && { return: format(returnDate, "yyyy-MM-dd") }),
      tripType,
      passengers,
    })

    window.location.href = `/search?${searchParams.toString()}`
  }

  return (
    <section id="flight-search" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Where would you like to go?</h2>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <Tabs defaultValue="roundtrip" onValueChange={setTripType}>
            <TabsList className="bg-secondary mb-6">
              <TabsTrigger
                value="roundtrip"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Round Trip
              </TabsTrigger>
              <TabsTrigger
                value="oneway"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                One Way
              </TabsTrigger>
              <TabsTrigger
                value="multicity"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Multi-City
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roundtrip" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Label className="text-muted-foreground text-xs mb-2 block">From</Label>
                  <AirportInput
                    type="from"
                    value={fromAirport}
                    onChange={(value) => setFromAirport(value)}
                    placeholder="City or airport"
                  />
                </div>

                <div className="relative">
                  <Label className="text-muted-foreground text-xs mb-2 block">To</Label>
                  <AirportInput
                    type="to"
                    value={toAirport}
                    onChange={(value) => setToAirport(value)}
                    placeholder="City or airport"
                  />
                  <button
                    onClick={swapAirports}
                    className="absolute -left-6 top-8 bg-card border border-border rounded-full p-1.5 hover:bg-secondary transition-colors hidden md:block"
                  >
                    <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs mb-2 block">Departure</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 bg-secondary border-border",
                          !departureDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        {departureDate ? format(departureDate, "MMM dd, yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                      <Calendar
                        mode="single"
                        selected={departureDate}
                        onSelect={setDepartureDate}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs mb-2 block">Return</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 bg-secondary border-border",
                          !returnDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        {returnDate ? format(returnDate, "MMM dd, yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={setReturnDate}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-6 items-end">
                <div className="flex-1">
                  <Label className="text-muted-foreground text-xs mb-2 block">Passengers & Class</Label>
                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger className="bg-secondary border-border h-12 text-foreground">
                      <div className="flex items-center">
                        <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                        <SelectValue placeholder="1 Adult, Economy" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="1-economy">1 Adult, Economy</SelectItem>
                      <SelectItem value="2-economy">2 Adults, Economy</SelectItem>
                      <SelectItem value="1-business">1 Adult, Business</SelectItem>
                      <SelectItem value="1-first">1 Adult, First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8"
                  onClick={handleSearchFlights}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search flights
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="oneway" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <Label className="text-muted-foreground text-xs mb-2 block">From</Label>
                  <AirportInput
                    type="from"
                    value={fromAirport}
                    onChange={(value) => setFromAirport(value)}
                    placeholder="City or airport"
                  />
                </div>

                <div className="relative">
                  <Label className="text-muted-foreground text-xs mb-2 block">To</Label>
                  <AirportInput
                    type="to"
                    value={toAirport}
                    onChange={(value) => setToAirport(value)}
                    placeholder="City or airport"
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs mb-2 block">Departure</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 bg-secondary border-border",
                          !departureDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        {departureDate ? format(departureDate, "MMM dd, yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                      <Calendar
                        mode="single"
                        selected={departureDate}
                        onSelect={setDepartureDate}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-6 items-end">
                <div className="flex-1">
                  <Label className="text-muted-foreground text-xs mb-2 block">Passengers & Class</Label>
                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger className="bg-secondary border-border h-12 text-foreground">
                      <div className="flex items-center">
                        <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                        <SelectValue placeholder="1 Adult, Economy" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="1-economy">1 Adult, Economy</SelectItem>
                      <SelectItem value="2-economy">2 Adults, Economy</SelectItem>
                      <SelectItem value="1-business">1 Adult, Business</SelectItem>
                      <SelectItem value="1-first">1 Adult, First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8"
                  onClick={handleSearchFlights}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search flights
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="multicity" className="mt-0">
              <div className="space-y-4">
                {multiCityLegs.map((leg, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-foreground">Flight {index + 1}</span>
                      {multiCityLegs.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeMultiCityLeg(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-xs mb-2 block">From</Label>
                        <AirportInput
                          type="from"
                          value={leg.from}
                          onChange={(value) => updateMultiCityLeg(index, "from", value)}
                          placeholder="City or airport"
                        />
                      </div>

                      <div>
                        <Label className="text-muted-foreground text-xs mb-2 block">To</Label>
                        <AirportInput
                          type="to"
                          value={leg.to}
                          onChange={(value) => updateMultiCityLeg(index, "to", value)}
                          placeholder="City or airport"
                        />
                      </div>

                      <div>
                        <Label className="text-muted-foreground text-xs mb-2 block">Departure</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-12 bg-secondary border-border",
                                !leg.date && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-5 w-5" />
                              {leg.date ? format(leg.date, "MMM dd, yyyy") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                            <Calendar
                              mode="single"
                              selected={leg.date}
                              onSelect={(date) => updateMultiCityLeg(index, "date", date)}
                              initialFocus
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                ))}

                {multiCityLegs.length < 5 && (
                  <Button variant="outline" className="w-full border-dashed bg-transparent" onClick={addMultiCityLeg}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add another flight
                  </Button>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-6 items-end">
                <div className="flex-1">
                  <Label className="text-muted-foreground text-xs mb-2 block">Passengers & Class</Label>
                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger className="bg-secondary border-border h-12 text-foreground">
                      <div className="flex items-center">
                        <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                        <SelectValue placeholder="1 Adult, Economy" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="1-economy">1 Adult, Economy</SelectItem>
                      <SelectItem value="2-economy">2 Adults, Economy</SelectItem>
                      <SelectItem value="1-business">1 Adult, Business</SelectItem>
                      <SelectItem value="1-first">1 Adult, First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8"
                  onClick={handleSearchFlights}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search flights
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
