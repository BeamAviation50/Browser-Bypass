// Deterministic flight generator that creates the same flights for the same date
// Seeds are based on the search parameters + current day, so flights regenerate daily

import { format } from "date-fns"

export interface Aircraft {
  name: string
  type: string
  rows: number
  seatsPerRow: number
}

export interface ConnectingFlight {
  flightNumber: string
  departure: {
    time: string
    timeZone: string
    airport: string
  }
  arrival: {
    time: string
    timeZone: string
    airport: string
  }
  duration: string
  aircraft: Aircraft
  layoverDuration?: string
}

export interface Flight {
  id: string
  flightNumber: string
  departure: {
    time: string
    timeZone: string
    airport: string
  }
  arrival: {
    time: string
    timeZone: string
    airport: string
  }
  duration: string
  aircraft: Aircraft
  price: number
  stops: number
  availableSeats: number
  connectingFlights?: ConnectingFlight[]
  totalDuration?: string
  layoverAirport?: string
  layoverDuration?: string
}

export interface FlightDuration {
  minMinutes: number
  maxMinutes: number
}

const NARROW_BODY_AIRCRAFT: Aircraft[] = [
  { name: "Airbus A321-211", type: "narrow-body", rows: 32, seatsPerRow: 6 }, // 5x in fleet
  { name: "Boeing 737-700", type: "narrow-body", rows: 33, seatsPerRow: 6 }, // 10x in fleet
]

const LONG_HAUL_AIRCRAFT: Aircraft = { name: "Airbus A350-900", type: "wide-body", rows: 40, seatsPerRow: 9 } // 2x in fleet (transatlantic only)

const AIRLINE_CODE = "LA"

const AIRLINES = ["LA", "SW", "AA", "UA", "DL", "AS"]

function extractAirportCode(location: string): string {
  if (!location || location.trim() === "") {
    // console.log("[v0] Empty location provided to extractAirportCode")
    return ""
  }

  const openParen = location.indexOf("(")
  const closeParen = location.indexOf(")")

  if (openParen !== -1 && closeParen !== -1 && closeParen > openParen) {
    const code = location.substring(openParen + 1, closeParen).toUpperCase()
    return code
  }

  // console.log("[v0] No parentheses found, using fallback: ", location)
  return location.toUpperCase().trim()
}

const TIME_ZONES: { [key: string]: string } = {
  // USA Timezones
  JFK: "EST",
  LGA: "EST",
  EWR: "EST",
  BOS: "EST",
  ATL: "EST",
  MIA: "EST",
  DTW: "EST",
  PHL: "EST",
  CLT: "EST",
  BNA: "CST",
  ORD: "CST",
  DFW: "CST",
  IAH: "CST",
  AUS: "CST",
  MSP: "CST",
  DEN: "MST",
  PHX: "MST",
  SLC: "MST",
  LAX: "PST",
  SFO: "PST",
  SEA: "PST",
  LAS: "PST",
  SAN: "PST",
  PDX: "PST",
  JAX: "EST",
  MCO: "EST",
  BDL: "EST",
  PBI: "EST",
  RDU: "EST",
  STL: "CST",
  MKE: "CST",
  CLE: "EST",
  CMH: "EST",
  PIT: "EST",
  TUL: "CST",
  OKC: "CST",
  ICT: "CST",
  MCI: "CST",
  OMA: "CST",
  DSM: "CST",
  FSD: "CST",
  FAR: "CST",
  RAP: "CST",
  // Europe Timezones (CET - Central European Time)
  CDG: "CET",
  ORY: "CET",
  FCO: "CET",
  CIA: "CET",
  MXP: "CET",
  LIN: "CET",
  MAD: "CET",
  AGP: "CET",
  BCN: "CET",
  IBZ: "CET",
  VCE: "CET",
  BIO: "CET",
  NAP: "CET",
  FLR: "CET",
  SUF: "CET",
  OMDW: "GST",
  LIRF: "CET",
  LICS: "CET",
  TNCA: "AST",
  TVSA: "AST",
  LHR: "GMT",
}

const TIMEZONE_OFFSETS: { [key: string]: number } = {
  EST: -5,
  CST: -6,
  MST: -7,
  PST: -8,
  CET: 1,
  GST: 4,
  AST: -4,
  GMT: 0,
}

const REALISTIC_DURATIONS: { [key: string]: [number, number] } = {
  // JFK routes
  "JFK-LAX": [370, 400], // ~6h 10m - 6h 40m
  "LAX-JFK": [310, 340], // ~5h 10m - 5h 40m (faster eastbound due to jet stream)
  "JFK-SFO": [360, 390], // ~6h - 6h 30m
  "SFO-JFK": [300, 330], // ~5h - 5h 30m
  "JFK-ORD": [150, 170], // ~2h 30m - 2h 50m
  "ORD-JFK": [140, 160], // ~2h 20m - 2h 40m
  "JFK-MIA": [185, 210], // ~3h 5m - 3h 30m
  "MIA-JFK": [175, 200], // ~2h 55m - 3h 20m
  "JFK-DFW": [200, 225], // ~3h 20m - 3h 45m
  "DFW-JFK": [190, 215], // ~3h 10m - 3h 35m
  "JFK-SEA": [315, 345], // ~5h 15m - 5h 45m
  "SEA-JFK": [280, 310], // ~4h 40m - 5h 10m
  "JFK-DEN": [220, 250], // ~3h 40m - 4h 10m
  "DEN-JFK": [210, 240], // ~3h 30m - 4h
  "JFK-PHX": [265, 295], // ~4h 25m - 4h 55m
  "PHX-JFK": [250, 280], // ~4h 10m - 4h 40m
  "JFK-LAS": [280, 310], // ~4h 40m - 5h 10m
  "LAS-JFK": [260, 290], // ~4h 20m - 4h 50m
  "JFK-ATL": [130, 150], // ~2h 10m - 2h 30m
  "ATL-JFK": [120, 140], // ~2h - 2h 20m
  "JFK-BOS": [70, 90], // ~1h 10m - 1h 30m
  "BOS-JFK": [65, 85], // ~1h 5m - 1h 25m

  // BOS routes
  "BOS-LAX": [375, 405], // ~6h 15m - 6h 45m
  "LAX-BOS": [320, 350], // ~5h 20m - 5h 50m
  "BOS-SFO": [365, 395], // ~6h 5m - 6h 35m
  "SFO-BOS": [310, 340], // ~5h 10m - 5h 40m
  "BOS-ORD": [150, 175], // ~2h 30m - 2h 55m
  "ORD-BOS": [140, 165], // ~2h 20m - 2h 45m
  "BOS-MIA": [195, 220], // ~3h 15m - 3h 40m
  "MIA-BOS": [185, 210], // ~3h 5m - 3h 30m
  "BOS-ATL": [155, 180], // ~2h 35m - 3h
  "ATL-BOS": [145, 170], // ~2h 25m - 2h 50m

  // ATL routes
  "ATL-LAX": [245, 275], // ~4h 5m - 4h 35m
  "LAX-ATL": [230, 260], // ~3h 50m - 4h 20m
  "ATL-SFO": [270, 300], // ~4h 30m - 5h
  "SFO-ATL": [255, 285], // ~4h 15m - 4h 45m
  "ATL-ORD": [115, 135], // ~1h 55m - 2h 15m
  "ORD-ATL": [105, 125], // ~1h 45m - 2h 5m
  "ATL-MIA": [105, 125], // ~1h 45m - 2h 5m
  "MIA-ATL": [100, 120], // ~1h 40m - 2h
  "ATL-DFW": [140, 165], // ~2h 20m - 2h 45m
  "DFW-ATL": [130, 155], // ~2h 10m - 2h 35m
  "ATL-DEN": [195, 220], // ~3h 15m - 3h 40m
  "DEN-ATL": [180, 205], // ~3h - 3h 25m
  "ATL-SEA": [280, 310], // ~4h 40m - 5h 10m
  "SEA-ATL": [265, 295], // ~4h 25m - 4h 55m

  // ORD routes
  "ORD-LAX": [260, 290], // ~4h 20m - 4h 50m
  "LAX-ORD": [230, 260], // ~3h 50m - 4h 20m
  "ORD-SFO": [255, 285], // ~4h 15m - 4h 45m
  "SFO-ORD": [230, 260], // ~3h 50m - 4h 20m
  "ORD-MIA": [175, 200], // ~2h 55m - 3h 20m
  "MIA-ORD": [165, 190], // ~2h 45m - 3h 10m
  "ORD-DFW": [145, 170], // ~2h 25m - 2h 50m
  "DFW-ORD": [135, 160], // ~2h 15m - 2h 40m
  "ORD-DEN": [145, 170], // ~2h 25m - 2h 50m
  "DEN-ORD": [135, 160], // ~2h 15m - 2h 40m
  "ORD-SEA": [240, 270], // ~4h - 4h 30m
  "SEA-ORD": [225, 255], // ~3h 45m - 4h 15m
  "ORD-LAS": [220, 250], // ~3h 40m - 4h 10m
  "LAS-ORD": [200, 230], // ~3h 20m - 3h 50m
  "ORD-PHX": [205, 235], // ~3h 25m - 3h 55m
  "PHX-ORD": [190, 220], // ~3h 10m - 3h 40m

  // DFW routes
  "DFW-LAX": [185, 215], // ~3h 5m - 3h 35m
  "LAX-DFW": [175, 205], // ~2h 55m - 3h 25m
  "DFW-SFO": [210, 240], // ~3h 30m - 4h
  "SFO-DFW": [195, 225], // ~3h 15m - 3h 45m
  "DFW-MIA": [160, 185], // ~2h 40m - 3h 5m
  "MIA-DFW": [150, 175], // ~2h 30m - 2h 55m
  "DFW-DEN": [115, 140], // ~1h 55m - 2h 20m
  "DEN-DFW": [105, 130], // ~1h 45m - 2h 10m
  "DFW-SEA": [230, 260], // ~3h 50m - 4h 20m
  "SEA-DFW": [215, 245], // ~3h 35m - 4h 5m
  "DFW-LAS": [170, 200], // ~2h 50m - 3h 20m
  "LAS-DFW": [160, 190], // ~2h 40m - 3h 10m
  "DFW-PHX": [145, 175], // ~2h 25m - 2h 55m
  "PHX-DFW": [135, 165], // ~2h 15m - 2h 45m

  // MIA routes
  "MIA-LAX": [295, 325], // ~4h 55m - 5h 25m
  "LAX-MIA": [280, 310], // ~4h 40m - 5h 10m
  "MIA-SFO": [325, 355], // ~5h 25m - 5h 55m
  "SFO-MIA": [310, 340], // ~5h 10m - 5h 40m
  "MIA-DEN": [230, 260], // ~3h 50m - 4h 20m
  "DEN-MIA": [215, 245], // ~3h 35m - 4h 5m
  "MIA-SEA": [340, 370], // ~5h 40m - 6h 10m
  "SEA-MIA": [325, 355], // ~5h 25m - 5h 55m
  "MIA-LAS": [280, 310], // ~4h 40m - 5h 10m
  "LAS-MIA": [265, 295], // ~4h 25m - 4h 55m
  "MIA-PHX": [255, 285], // ~4h 15m - 4h 45m
  "PHX-MIA": [240, 270], // ~4h - 4h 30m

  // DEN routes
  "DEN-LAX": [145, 175], // ~2h 25m - 2h 55m
  "LAX-DEN": [135, 165], // ~2h 15m - 2h 45m
  "DEN-SFO": [150, 180], // ~2h 30m - 3h
  "SFO-DEN": [140, 170], // ~2h 20m - 2h 50m
  "DEN-SEA": [155, 185], // ~2h 35m - 3h 5m
  "SEA-DEN": [145, 175], // ~2h 25m - 2h 55m
  "DEN-LAS": [100, 125], // ~1h 40m - 2h 5m
  "LAS-DEN": [95, 120], // ~1h 35m - 2h
  "DEN-PHX": [105, 130], // ~1h 45m - 2h 10m
  "PHX-DEN": [100, 125], // ~1h 40m - 2h 5m

  // West Coast routes
  "LAX-SFO": [75, 95], // ~1h 15m - 1h 35m
  "SFO-LAX": [70, 90], // ~1h 10m - 1h 30m
  "LAX-SEA": [155, 185], // ~2h 35m - 3h 5m
  "SEA-LAX": [145, 175], // ~2h 25m - 2h 55m
  "LAX-LAS": [55, 75], // ~55m - 1h 15m
  "LAS-LAX": [50, 70], // ~50m - 1h 10m
  "LAX-PHX": [65, 85], // ~1h 5m - 1h 25m
  "PHX-LAX": [60, 80], // ~1h - 1h 20m
  "SFO-SEA": [115, 140], // ~1h 55m - 2h 20m
  "SEA-SFO": [105, 130], // ~1h 45m - 2h 10m
  "SFO-LAS": [80, 100], // ~1h 20m - 1h 40m
  "LAS-SFO": [75, 95], // ~1h 15m - 1h 35m
  "SFO-PHX": [100, 125], // ~1h 40m - 2h 5m
  "PHX-SFO": [95, 120], // ~1h 35m - 2h
  "SEA-LAS": [145, 175], // ~2h 25m - 2h 55m
  "LAS-SEA": [155, 185], // ~2h 35m - 3h 5m
  "SEA-PHX": [165, 195], // ~2h 45m - 3h 15m
  "PHX-SEA": [175, 205], // ~2h 55m - 3h 25m
  "LAS-PHX": [55, 75], // ~55m - 1h 15m
  "PHX-LAS": [50, 70], // ~50m - 1h 10m

  // MSP routes
  "MSP-JFK": [155, 180], // ~2h 35m - 3h
  "JFK-MSP": [165, 190], // ~2h 45m - 3h 10m
  "MSP-LAX": [220, 250], // ~3h 40m - 4h 10m
  "LAX-MSP": [200, 230], // ~3h 20m - 3h 50m
  "MSP-ORD": [75, 95], // ~1h 15m - 1h 35m
  "ORD-MSP": [70, 90], // ~1h 10m - 1h 30m
  "MSP-DEN": [115, 140], // ~1h 55m - 2h 20m
  "DEN-MSP": [105, 130], // ~1h 45m - 2h 10m
  "MSP-SEA": [195, 225], // ~3h 15m - 3h 45m
  "SEA-MSP": [180, 210], // ~3h - 3h 30m

  // IAH routes
  "IAH-JFK": [200, 225], // ~3h 20m - 3h 45m
  "JFK-IAH": [220, 245], // ~3h 40m - 4h 5m
  "IAH-LAX": [195, 225], // ~3h 15m - 3h 45m
  "LAX-IAH": [180, 210], // ~3h - 3h 30m
  "IAH-ORD": [145, 170], // ~2h 25m - 2h 50m
  "ORD-IAH": [155, 180], // ~2h 35m - 3h
  "IAH-MIA": [155, 180], // ~2h 35m - 3h
  "MIA-IAH": [145, 170], // ~2h 25m - 2h 50m
  "IAH-DEN": [135, 160], // ~2h 15m - 2h 40m
  "DEN-IAH": [125, 150], // ~2h 5m - 2h 30m
  "IAH-SEA": [240, 270], // ~4h - 4h 30m
  "SEA-IAH": [225, 255], // ~3h 45m - 4h 15m
}

const AIRPORT_COORDINATES: { [key: string]: { lat: number; lon: number } } = {
  // USA East Coast
  JFK: { lat: 40.6413, lon: -73.7781 },
  BOS: { lat: 42.3656, lon: -71.0096 },
  BDL: { lat: 41.9383, lon: -72.6839 },
  ATL: { lat: 33.6407, lon: -84.4277 },
  MIA: { lat: 25.7959, lon: -80.287 },
  FLL: { lat: 26.0726, lon: -80.1527 },
  PBI: { lat: 26.6832, lon: -80.0956 },
  JAX: { lat: 30.4941, lon: -81.6879 },
  // USA Central
  ORD: { lat: 41.9742, lon: -87.9073 },
  DFW: { lat: 32.8975, lon: -97.0382 },
  IAH: { lat: 29.6575, lon: -95.2808 },
  MSP: { lat: 44.882, lon: -93.2169 },
  FAR: { lat: 46.9245, lon: -96.8256 },
  CLE: { lat: 41.4117, lon: -81.8498 },
  STL: { lat: 38.7469, lon: -90.37 },
  // USA West
  LAX: { lat: 33.9425, lon: -118.4081 },
  SFO: { lat: 37.6213, lon: -122.379 },
  SEA: { lat: 47.4502, lon: -122.3088 },
  DEN: { lat: 39.8561, lon: -104.6737 },
  PHX: { lat: 33.7298, lon: -112.1581 },
  LAS: { lat: 36.0801, lon: -115.1537 },
  PDX: { lat: 45.5887, lon: -122.5975 },
  // Europe
  LHR: { lat: 51.47, lon: -0.4543 },
  CDG: { lat: 49.0097, lon: 2.5479 },
  FCO: { lat: 41.8003, lon: 12.2389 },
  BCN: { lat: 41.2971, lon: 2.0787 },
  MAD: { lat: 40.4719, lon: -3.5603 },
  // Middle East
  OMDW: { lat: 25.2528, lon: 55.3644 },
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function isTransatlanticRoute(fromCode: string, toCode: string): boolean {
  const usAirports = [
    "JFK",
    "LGA",
    "EWR",
    "BOS",
    "ATL",
    "MIA",
    "DTW",
    "PHL",
    "CLT",
    "BNA",
    "ORD",
    "DFW",
    "IAH",
    "AUS",
    "MSP",
    "DEN",
    "PHX",
    "SLC",
    "LAX",
    "SFO",
    "SEA",
    "LAS",
    "SAN",
    "PDX",
    "JAX",
    "MCO",
    "BDL",
    "PBI",
    "RDU",
    "STL",
    "MKE",
    "CLE",
    "CMH",
    "PIT",
  ]
  const europeAirports = [
    "CDG",
    "ORY",
    "FCO",
    "CIA",
    "MXP",
    "LIN",
    "MAD",
    "AGP",
    "BCN",
    "IBZ",
    "VCE",
    "BIO",
    "NAP",
    "FLR",
    "SUF",
    "LHR",
  ]

  const middleEastAirports = ["OMDW"]

  const fromUS = usAirports.includes(fromCode)
  const toUS = usAirports.includes(toCode)
  const fromEU = europeAirports.includes(fromCode)
  const toEU = europeAirports.includes(toCode)
  const fromME = middleEastAirports.includes(fromCode)
  const toME = middleEastAirports.includes(toCode)

  const result =
    (fromUS && toEU) || (fromEU && toUS) || (fromME && toEU) || (fromEU && toME) || (fromUS && toME) || (fromME && toUS)
  // console.log(
  //   "[v0] isTransatlanticRoute check:",
  //   fromCode,
  //   "->",
  //   toCode,
  //   "fromUS:",
  //   fromUS,
  //   "toEU:",
  //   toEU,
  //   "fromEU:",
  //   fromEU,
  //   "toUS:",
  //   toUS,
  //   "fromME:",
  //   fromME,
  //   "toME:",
  //   toME,
  //   "result:",
  //   result,
  // )
  return result
}

function isEastWestUSARoute(departureAirport: string, arrivalAirport: string): boolean {
  const eastAirports = [
    "JFK",
    "LGA",
    "EWR",
    "BOS",
    "ATL",
    "MIA",
    "DTW",
    "PHL",
    "CLT",
    "BNA",
    "ORD",
    "DFW",
    "IAH",
    "AUS",
    "MSP",
    "DEN",
    "PHX",
    "SLC",
    "FAR",
    "PIT",
    "MCO",
    "JAX",
  ]
  const westAirports = ["LAX", "SFO", "SEA", "LAS", "SAN", "PDX", "PHX", "DEN", "SLC"]

  const deptIsEast = eastAirports.includes(departureAirport)
  const destIsWest = westAirports.includes(arrivalAirport)
  const deptIsWest = westAirports.includes(departureAirport)
  const destIsEast = eastAirports.includes(arrivalAirport)

  return (deptIsEast && destIsWest) || (deptIsWest && destIsEast)
}

function calculateDistance(from: string, to: string): number {
  const fromCoord = AIRPORT_COORDINATES[from]
  const toCoord = AIRPORT_COORDINATES[to]

  if (!fromCoord || !toCoord) {
    // console.log(`[v0] Missing coordinates for ${from} or ${to}`)
    return 2000 // Default fallback
  }

  const R = 3959 // Earth radius in miles
  const lat1 = (fromCoord.lat * Math.PI) / 180
  const lat2 = (toCoord.lat * Math.PI) / 180
  const deltaLat = ((toCoord.lat - fromCoord.lat) * Math.PI) / 180
  const deltaLon = ((toCoord.lon - fromCoord.lon) * Math.PI) / 180

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function calculateFlightDuration(from: string, to: string): [number, number] {
  const distance = calculateDistance(from, to)
  const cruiseSpeed = 460 // Average cruise speed in mph (accounts for taxi, climb, descent)
  const baseTime = (distance / cruiseSpeed) * 60 // Convert to minutes

  // Add some variability based on distance
  const variance = Math.max(15, baseTime * 0.05) // 5% variance or 15 mins minimum
  const minTime = Math.round(baseTime - variance)
  const maxTime = Math.round(baseTime + variance)

  // console.log(`[v0] Flight ${from}-${to}: Distance=${distance.toFixed(0)}mi, Duration=${minTime}-${maxTime}min`)
  return [minTime, maxTime]
}

function generateDeterministicFlights(
  from: string,
  to: string,
  date: Date,
  passengers: number,
  cabinClass: string,
  refreshKey = 0,
  dynamicDuration?: FlightDuration,
): Flight[] {
  // Validate inputs - return empty array if missing required data
  if (!from || !to || from.trim() === "" || to.trim() === "") {
    // console.log("[v0] Missing from or to airport, returning empty flights array")
    return []
  }

  if (!date || isNaN(date.getTime())) {
    // console.log("[v0] Invalid date provided, returning empty flights array")
    return []
  }

  const departureAirport = extractAirportCode(from)
  const arrivalAirport = extractAirportCode(to)

  // Additional validation after extraction
  if (!departureAirport || !arrivalAirport) {
    // console.log("[v0] Could not extract airport codes, returning empty flights array")
    return []
  }

  const dateString = format(date, "yyyy-MM-dd")
  const seedString = `${departureAirport}-${arrivalAirport}-${dateString}-${refreshKey}`
  let seed = 0
  for (let i = 0; i < seedString.length; i++) {
    seed = (seed << 5) - seed + seedString.charCodeAt(i)
    seed = seed & seed
  }

  const flights: Flight[] = []
  const isTransatlantic = isTransatlanticRoute(departureAirport, arrivalAirport)
  const isEastWestUSA = isEastWestUSARoute(departureAirport, arrivalAirport)

  // console.log(
  //   "[v0] Generating flights for route:",
  //   `${departureAirport}-${arrivalAirport}`,
  //   "isTransatlantic:",
  //   isTransatlantic,
  //   "isEastWestUSA:",
  //   isEastWestUSA,
  // )

  // Generate Redbird flights for east-west USA routes
  // Note: This logic is now handled in getFlights to consolidate Redbird generation there.
  // if (isEastWestUSA) {
  //   flights.push(...generateRedBirdFlights(departureAirport, arrivalAirport, date, passengers, cabinClass));
  // }

  // Generate 4-7 flights per day (fewer for transatlantic)
  const numFlights = isTransatlantic ? 2 + Math.floor(seededRandom(seed) * 3) : 5 + Math.floor(seededRandom(seed) * 3)

  for (let i = 0; i < numFlights; i++) {
    seed++
    const rand1 = seededRandom(seed)
    seed++
    const rand2 = seededRandom(seed)
    seed++
    const rand3 = seededRandom(seed)
    seed++
    const rand4 = seededRandom(seed)
    seed++
    const rand5 = seededRandom(seed)

    // Stagger departure times throughout the day based on flight duration
    // Longer flights get evening/night departure times so they arrive at reasonable hours
    let timeSlots: number[]
    let durationMinutes: number
    const routeKey = `${departureAirport}-${arrivalAirport}`
    const durationRange = REALISTIC_DURATIONS[routeKey]

    if (dynamicDuration) {
      durationMinutes =
        dynamicDuration.minMinutes + Math.floor(rand3 * (dynamicDuration.maxMinutes - dynamicDuration.minMinutes))
    } else if (isTransatlantic) {
      durationMinutes = 420 + Math.floor(rand3 * 180) // 7-10 hours for transatlantic
    } else if (durationRange) {
      durationMinutes = durationRange[0] + Math.floor(rand3 * (durationRange[1] - durationRange[0]))
    } else {
      const calculatedDuration = calculateFlightDuration(departureAirport, arrivalAirport)
      durationMinutes = calculatedDuration[0] - 30 + Math.floor(rand3 * 60)
      if (durationMinutes < 60) durationMinutes = 60 // Minimum 1 hour duration
    }

    // console.log("[v0] Flight", i, "duration:", durationMinutes, "minutes for route:", routeKey)

    if (isTransatlantic) {
      timeSlots = [6, 8, 10, 14, 17, 20, 22, 23]
    } else {
      // Generate all hours from 3am to 11pm
      timeSlots = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
    }

    const slotIndex = Math.floor(seededRandom(seed) * timeSlots.length)
    seed++
    const departureHour = timeSlots[slotIndex]
    const departureMinute = Math.floor(rand2 * 12) * 5 // 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55
    const departureTime = new Date(date)
    departureTime.setHours(departureHour, departureMinute, 0, 0)

    const durationHours = Math.floor(durationMinutes / 60)
    const durationMins = durationMinutes % 60

    const departureTimeZone = TIME_ZONES[departureAirport] || "EST"
    const arrivalTimeZone = TIME_ZONES[arrivalAirport] || "EST"

    const arrivalTime = new Date(departureTime)
    arrivalTime.setMinutes(arrivalTime.getMinutes() + durationMinutes)

    // Apply timezone offset difference
    const departureOffset = TIMEZONE_OFFSETS[departureTimeZone] || -5
    const arrivalOffset = TIMEZONE_OFFSETS[arrivalTimeZone] || -5
    const offsetDifferenceHours = arrivalOffset - departureOffset

    arrivalTime.setHours(arrivalTime.getHours() + offsetDifferenceHours)

    // console.log(
    //   "[v0] Timezone offset applied:",
    //   offsetDifferenceHours,
    //   "hours from",
    //   departureTimeZone,
    //   "to",
    //   arrivalTimeZone,
    // )

    let aircraft: Aircraft
    if (isTransatlantic) {
      aircraft = LONG_HAUL_AIRCRAFT
    } else {
      aircraft = NARROW_BODY_AIRCRAFT[Math.floor(rand5 * 2)]
    }

    const totalSeats = aircraft.rows * aircraft.seatsPerRow
    const bookedSeats = Math.floor(rand4 * (totalSeats * 0.7))
    const availableSeats = totalSeats - bookedSeats

    const flightNumber = `${AIRLINE_CODE}${100 + Math.floor(rand2 * 900)}`

    // Base price calculation
    let basePrice = 100

    if (isTransatlantic) {
      // Transatlantic flights: $599-$1,299 economy base
      basePrice = 599 + Math.floor(rand1 * 700)
    } else if (durationMinutes > 300) {
      // Cross-country flights (5+ hours): $199-$449
      basePrice = 199 + Math.floor(rand1 * 250)
    } else if (durationMinutes > 240) {
      // Long domestic flights (4-5 hours): $179-$399
      basePrice = 179 + Math.floor(rand1 * 220)
    } else if (durationMinutes > 120) {
      // Medium domestic flights (2-4 hours): $129-$349
      basePrice = 129 + Math.floor(rand1 * 220)
    } else {
      // Short flights (<2 hours): $89-$249
      basePrice = 89 + Math.floor(rand1 * 160)
    }

    // European and Middle East routes get premium pricing
    const departureAirportCode = departureAirport
    const arrivalAirportCode = arrivalAirport
    const europeAirports = ["CDG", "FCO", "MAD", "BCN", "MXP", "SUF", "OMDW"]
    const isEuropeRoute =
      (europeAirports.includes(departureAirportCode) && europeAirports.includes(arrivalAirportCode)) ||
      (europeAirports.includes(departureAirportCode) && !isTransatlantic) ||
      (europeAirports.includes(arrivalAirportCode) && !isTransatlantic)

    if (isEuropeRoute && !isTransatlantic) {
      // European regional flights: $249-$599
      basePrice = 249 + Math.floor(rand1 * 350)
    }

    let priceMultiplier = 1.0
    if (cabinClass === "first") {
      priceMultiplier = 1.4
    } else if (cabinClass === "economy") {
      // Economy is 10% cheaper
      priceMultiplier = 0.9
    }

    const price = Math.round(basePrice * passengers * priceMultiplier)

    flights.push({
      id: `${flightNumber}-${dateString}-${i}`,
      flightNumber,
      departure: {
        time: format(departureTime, "h:mm a"),
        timeZone: departureTimeZone,
        airport: departureAirport,
      },
      arrival: {
        time: format(arrivalTime, "h:mm a"),
        timeZone: arrivalTimeZone,
        airport: arrivalAirport,
      },
      duration: `${durationHours}h ${durationMins}m`,
      aircraft,
      price,
      stops: 0,
      availableSeats,
    })
  }

  return flights.sort((a, b) => {
    const parseTime = (timeStr: string) => {
      const [time, period] = timeStr.split(" ")
      let [hours, minutes] = time.split(":").map(Number)
      if (period === "PM" && hours !== 12) hours += 12
      if (period === "AM" && hours === 12) hours = 0
      return hours * 60 + minutes
    }
    return parseTime(a.departure.time) - parseTime(b.departure.time)
  })
}

const HUB_AIRPORTS = ["JFK", "ATL", "ORD", "DFW", "LAX", "MIA", "BOS"]

function generateConnectingFlights(
  from: string,
  to: string,
  date: Date,
  passengers: number,
  cabinClass: string,
  seed: number,
): Flight[] {
  const departureAirport = extractAirportCode(from)
  const arrivalAirport = extractAirportCode(to)
  const dateString = format(date, "yyyy-MM-dd")

  const connectingFlights: Flight[] = []

  // Find suitable hub airports for connection
  const suitableHubs = HUB_AIRPORTS.filter((hub) => hub !== departureAirport && hub !== arrivalAirport)

  // Generate 1-2 connecting flight options
  const numConnecting = Math.min(2, Math.floor(seededRandom(seed) * 3))

  for (let i = 0; i < numConnecting; i++) {
    seed++
    const hubIndex = Math.floor(seededRandom(seed) * suitableHubs.length)
    const hubAirport = suitableHubs[hubIndex]

    seed++
    const rand1 = seededRandom(seed)
    seed++
    const rand2 = seededRandom(seed)
    seed++
    const rand3 = seededRandom(seed)
    seed++
    const rand4 = seededRandom(seed)

    // First leg: Origin to Hub
    const leg1RouteKey = `${departureAirport}-${hubAirport}`
    const leg1DurationRange = REALISTIC_DURATIONS[leg1RouteKey]
    let leg1Duration: number

    if (leg1DurationRange) {
      leg1Duration = leg1DurationRange[0] + Math.floor(rand1 * (leg1DurationRange[1] - leg1DurationRange[0]))
    } else {
      leg1Duration = calculateFlightDuration(departureAirport, hubAirport)[0]
    }

    // Second leg: Hub to Destination
    const leg2RouteKey = `${hubAirport}-${arrivalAirport}`
    const leg2DurationRange = REALISTIC_DURATIONS[leg2RouteKey]
    let leg2Duration: number

    if (leg2DurationRange) {
      leg2Duration = leg2DurationRange[0] + Math.floor(rand2 * (leg2DurationRange[1] - leg2DurationRange[0]))
    } else {
      leg2Duration = calculateFlightDuration(hubAirport, arrivalAirport)[0]
    }

    // Skip if connecting flight doesn't make sense (legs too long individually)
    if (leg1Duration < 30 || leg2Duration < 30) continue

    // Layover duration: 1-3 hours
    const layoverMinutes = 60 + Math.floor(rand3 * 120)

    // Total duration
    const totalMinutes = leg1Duration + layoverMinutes + leg2Duration

    // Departure time for first leg
    const departureHour = 6 + Math.floor(rand4 * 14) // 6am - 8pm
    const departureMinute = Math.floor(rand1 * 12) * 5 // 0, 5, 10... 55
    const leg1DepartureTime = new Date(date)
    leg1DepartureTime.setHours(departureHour, departureMinute, 0, 0)

    // Arrival time for first leg
    const leg1ArrivalTime = new Date(leg1DepartureTime)
    leg1ArrivalTime.setMinutes(leg1ArrivalTime.getMinutes() + leg1Duration)

    // Apply timezone offset for leg 1
    const leg1DepTZ = TIME_ZONES[departureAirport] || "EST"
    const leg1ArrTZ = TIME_ZONES[hubAirport] || "EST"
    const leg1DepOffset = TIMEZONE_OFFSETS[leg1DepTZ] || -5
    const leg1ArrOffset = TIMEZONE_OFFSETS[leg1ArrTZ] || -5
    leg1ArrivalTime.setHours(leg1ArrivalTime.getHours() + (leg1ArrOffset - leg1DepOffset))

    // Departure time for second leg (after layover)
    const leg2DepartureTime = new Date(leg1ArrivalTime)
    leg2DepartureTime.setMinutes(leg2DepartureTime.getMinutes() + layoverMinutes)

    // Arrival time for second leg
    const leg2ArrivalTime = new Date(leg2DepartureTime)
    leg2ArrivalTime.setMinutes(leg2ArrivalTime.getMinutes() + leg2Duration)

    // Apply timezone offset for leg 2
    const leg2DepTZ = TIME_ZONES[hubAirport] || "EST"
    const leg2ArrTZ = TIME_ZONES[arrivalAirport] || "EST"
    const leg2DepOffset = TIMEZONE_OFFSETS[leg2DepTZ] || -5
    const leg2ArrOffset = TIMEZONE_OFFSETS[leg2ArrTZ] || -5
    leg2ArrivalTime.setHours(leg2ArrivalTime.getHours() + (leg2ArrOffset - leg2DepOffset))

    // Generate flight numbers
    const flightNumber1 = `${AIRLINE_CODE}${100 + Math.floor(rand1 * 900)}`
    const flightNumber2 = `${AIRLINE_CODE}${100 + Math.floor(rand2 * 900)}`

    // Aircraft selection
    const isLeg1LongHaul = isTransatlanticRoute(departureAirport, hubAirport)
    const isLeg2LongHaul = isTransatlanticRoute(hubAirport, arrivalAirport)
    const leg1Aircraft = isLeg1LongHaul ? LONG_HAUL_AIRCRAFT : NARROW_BODY_AIRCRAFT[Math.floor(rand3 * 2)]
    const leg2Aircraft = isLeg2LongHaul ? LONG_HAUL_AIRCRAFT : NARROW_BODY_AIRCRAFT[Math.floor(rand4 * 2)]

    // Price calculation (connecting flights are usually 15-25% cheaper)
    let basePrice = 100
    const directRouteKey = `${departureAirport}-${arrivalAirport}`
    const directDuration = REALISTIC_DURATIONS[directRouteKey]

    if (directDuration) {
      const avgDuration = (directDuration[0] + directDuration[1]) / 2
      if (avgDuration > 480) basePrice = 599 + Math.floor(rand1 * 500)
      else if (avgDuration > 300) basePrice = 199 + Math.floor(rand1 * 200)
      else if (avgDuration > 180) basePrice = 149 + Math.floor(rand1 * 150)
      else basePrice = 99 + Math.floor(rand1 * 100)
    } else {
      basePrice = 149 + Math.floor(rand1 * 200)
    }

    // Apply discount for connecting flight
    basePrice = Math.round(basePrice * 0.8)

    // Apply cabin class multiplier
    let priceMultiplier = 1.0
    if (cabinClass === "first") priceMultiplier = 1.4
    else if (cabinClass === "economy") priceMultiplier = 0.9

    const price = Math.round(basePrice * passengers * priceMultiplier)

    // Format durations
    const leg1Hours = Math.floor(leg1Duration / 60)
    const leg1Mins = leg1Duration % 60
    const leg2Hours = Math.floor(leg2Duration / 60)
    const leg2Mins = leg2Duration % 60
    const layoverHours = Math.floor(layoverMinutes / 60)
    const layoverMins = layoverMinutes % 60
    const totalHours = Math.floor(totalMinutes / 60)
    const totalMins = totalMinutes % 60

    connectingFlights.push({
      id: `${flightNumber1}-${flightNumber2}-${dateString}-${i}`,
      flightNumber: `${flightNumber1}/${flightNumber2}`,
      departure: {
        time: format(leg1DepartureTime, "h:mm a"),
        timeZone: leg1DepTZ,
        airport: departureAirport,
      },
      arrival: {
        time: format(leg2ArrivalTime, "h:mm a"),
        timeZone: leg2ArrTZ,
        airport: arrivalAirport,
      },
      duration: `${totalHours}h ${totalMins}m`,
      aircraft: leg1Aircraft,
      price,
      stops: 1,
      availableSeats:
        Math.min(leg1Aircraft.rows * leg1Aircraft.seatsPerRow, leg2Aircraft.rows * leg2Aircraft.seatsPerRow) -
        Math.floor(rand4 * 50),
      layoverAirport: hubAirport,
      layoverDuration: `${layoverHours}h ${layoverMins}m`,
      totalDuration: `${totalHours}h ${totalMins}m`,
      connectingFlights: [
        {
          flightNumber: flightNumber1,
          departure: {
            time: format(leg1DepartureTime, "h:mm a"),
            timeZone: leg1DepTZ,
            airport: departureAirport,
          },
          arrival: {
            time: format(leg1ArrivalTime, "h:mm a"),
            timeZone: leg1ArrTZ,
            airport: hubAirport,
          },
          duration: `${leg1Hours}h ${leg1Mins}m`,
          aircraft: leg1Aircraft,
        },
        {
          flightNumber: flightNumber2,
          departure: {
            time: format(leg2DepartureTime, "h:mm a"),
            timeZone: leg2DepTZ,
            airport: hubAirport,
          },
          arrival: {
            time: format(leg2ArrivalTime, "h:mm a"),
            timeZone: leg2ArrTZ,
            airport: arrivalAirport,
          },
          duration: `${leg2Hours}h ${leg2Mins}m`,
          aircraft: leg2Aircraft,
          layoverDuration: `${layoverHours}h ${layoverMins}m`,
        },
      ],
    })
  }

  return connectingFlights
}

function generateRedBirdFlights(
  departureAirport: string,
  arrivalAirport: string,
  date: Date,
  passengers: number,
  cabinClass: string,
  dynamicDuration?: FlightDuration,
): Flight[] {
  const redBirdFlights: Flight[] = []
  const dateString = format(date, "yyyy-MM-dd")

  if (!dynamicDuration) return []

  // Generate 2 Redbird early morning flights
  for (let i = 0; i < 2; i++) {
    const durationMinutes =
      dynamicDuration.minMinutes + Math.floor(Math.random() * (dynamicDuration.maxMinutes - dynamicDuration.minMinutes))

    const departureHours = [7, 8]
    const departureMinutes = [30, 0]
    const depHour = departureHours[i % 2]
    const depMin = departureMinutes[i % 2]

    const departureTime = new Date(date)
    departureTime.setHours(depHour, depMin, 0, 0)

    const durationHours = Math.floor(durationMinutes / 60)
    const durationMins = durationMinutes % 60

    const departureTimeZone = TIME_ZONES[departureAirport] || "EST"
    const arrivalTimeZone = TIME_ZONES[arrivalAirport] || "EST"

    const arrivalTime = new Date(departureTime)
    arrivalTime.setMinutes(arrivalTime.getMinutes() + durationMinutes)

    const departureOffset = TIMEZONE_OFFSETS[departureTimeZone] || -5
    const arrivalOffset = TIMEZONE_OFFSETS[arrivalTimeZone] || -5
    const offsetDifferenceHours = arrivalOffset - departureOffset
    arrivalTime.setHours(arrivalTime.getHours() + offsetDifferenceHours)

    // Redbird branded flights
    const flightNumber = `RB${100 + i}`

    // Base pricing for cross-country
    const basePrice = 199 + Math.floor(Math.random() * 250)

    let priceMultiplier = 1.0
    if (cabinClass === "first") {
      priceMultiplier = 1.4
    } else if (cabinClass === "economy") {
      priceMultiplier = 0.9
    }

    const price = Math.round(basePrice * passengers * priceMultiplier)

    const aircraft = NARROW_BODY_AIRCRAFT[0]
    const totalSeats = aircraft.rows * aircraft.seatsPerRow
    const bookedSeats = Math.floor(Math.random() * (totalSeats * 0.6))
    const availableSeats = totalSeats - bookedSeats

    redBirdFlights.push({
      id: `${flightNumber}-${dateString}-redbird`,
      flightNumber,
      departure: {
        time: format(departureTime, "h:mm a"),
        timeZone: departureTimeZone,
        airport: departureAirport,
      },
      arrival: {
        time: format(arrivalTime, "h:mm a"),
        timeZone: arrivalTimeZone,
        airport: arrivalAirport,
      },
      duration: `${durationHours}h ${durationMins}m`,
      aircraft,
      price,
      stops: 0,
      availableSeats,
    })
  }

  return redBirdFlights
}

export function getFlights(
  from: string,
  to: string,
  date: Date | string,
  passengers: number | string,
  cabinClass = "economy",
  refreshKey = 0,
  dynamicDuration?: FlightDuration,
): Flight[] {
  // console.log("[v0] getFlights called with:", from, to, date, passengers, cabinClass, refreshKey, dynamicDuration)

  if (!from || !to) {
    // console.log("[v0] Missing from or to airport")
    return []
  }

  const parsedDate = typeof date === "string" ? new Date(date) : date
  const numPassengers = typeof passengers === "string" ? Number.parseInt(passengers) || 1 : passengers

  const departureAirport = extractAirportCode(from)
  const arrivalAirport = extractAirportCode(to)

  if (!departureAirport || !arrivalAirport) {
    // console.log("[v0] Could not extract airport codes")
    return []
  }

  let allFlights = generateDeterministicFlights(
    from,
    to,
    parsedDate,
    numPassengers,
    cabinClass,
    refreshKey,
    dynamicDuration,
  )

  if (isEastWestUSARoute(departureAirport, arrivalAirport)) {
    const redBirdFlights = generateRedBirdFlights(
      departureAirport,
      arrivalAirport,
      parsedDate,
      numPassengers,
      cabinClass,
      dynamicDuration,
    )
    allFlights = [...redBirdFlights, ...allFlights]
  }

  // Sort by departure time
  return allFlights.sort((a, b) => {
    const parseTime = (timeStr: string) => {
      const [time, period] = timeStr.split(" ")
      let [hours, minutes] = time.split(":").map(Number)
      if (period === "PM" && hours !== 12) hours += 12
      if (period === "AM" && hours === 12) hours = 0
      return hours * 60 + minutes
    }
    return parseTime(a.departure.time) - parseTime(b.departure.time)
  })
}

export { extractAirportCode }
