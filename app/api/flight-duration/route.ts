import { type NextRequest, NextResponse } from "next/server"

// Real-world accurate flight durations based on actual airline schedules
// Format: [minMinutes, maxMinutes] - accounts for wind, routing, and typical variations
const ACCURATE_FLIGHT_DURATIONS: { [key: string]: [number, number] } = {
  // === JFK (New York) Routes ===
  "JFK-LAX": [330, 360], // 5h 30m - 6h (westbound slower)
  "LAX-JFK": [280, 310], // 4h 40m - 5h 10m (eastbound faster)
  "JFK-SFO": [360, 390], // 6h - 6h 30m
  "SFO-JFK": [305, 335], // 5h 5m - 5h 35m
  "JFK-ORD": [150, 170], // 2h 30m - 2h 50m
  "ORD-JFK": [130, 150], // 2h 10m - 2h 30m
  "JFK-MIA": [180, 200], // 3h - 3h 20m
  "MIA-JFK": [170, 190], // 2h 50m - 3h 10m
  "JFK-DFW": [225, 250], // 3h 45m - 4h 10m
  "DFW-JFK": [195, 220], // 3h 15m - 3h 40m
  "JFK-SEA": [345, 375], // 5h 45m - 6h 15m
  "SEA-JFK": [290, 320], // 4h 50m - 5h 20m
  "JFK-DEN": [255, 280], // 4h 15m - 4h 40m
  "DEN-JFK": [220, 245], // 3h 40m - 4h 5m
  "JFK-PHX": [300, 330], // 5h - 5h 30m
  "PHX-JFK": [265, 295], // 4h 25m - 4h 55m
  "JFK-LAS": [315, 345], // 5h 15m - 5h 45m
  "LAS-JFK": [275, 305], // 4h 35m - 5h 5m
  "JFK-ATL": [130, 150], // 2h 10m - 2h 30m
  "ATL-JFK": [115, 135], // 1h 55m - 2h 15m
  "JFK-BOS": [55, 75], // 55m - 1h 15m
  "BOS-JFK": [55, 75], // 55m - 1h 15m
  "JFK-MSP": [195, 220], // 3h 15m - 3h 40m
  "MSP-JFK": [165, 190], // 2h 45m - 3h 10m
  "JFK-IAH": [230, 255], // 3h 50m - 4h 15m
  "IAH-JFK": [200, 225], // 3h 20m - 3h 45m

  // === BOS (Boston) Routes ===
  "BOS-LAX": [360, 390], // 6h - 6h 30m
  "LAX-BOS": [310, 340], // 5h 10m - 5h 40m
  "BOS-SFO": [370, 400], // 6h 10m - 6h 40m
  "SFO-BOS": [320, 350], // 5h 20m - 5h 50m
  "BOS-ORD": [155, 175], // 2h 35m - 2h 55m
  "ORD-BOS": [140, 160], // 2h 20m - 2h 40m
  "BOS-MIA": [195, 220], // 3h 15m - 3h 40m
  "MIA-BOS": [185, 210], // 3h 5m - 3h 30m
  "BOS-ATL": [155, 180], // 2h 35m - 3h
  "ATL-BOS": [145, 170], // 2h 25m - 2h 50m
  "BOS-DFW": [240, 265], // 4h - 4h 25m
  "DFW-BOS": [210, 235], // 3h 30m - 3h 55m
  "BOS-SEA": [355, 385], // 5h 55m - 6h 25m
  "SEA-BOS": [305, 335], // 5h 5m - 5h 35m
  "BOS-DEN": [265, 290], // 4h 25m - 4h 50m
  "DEN-BOS": [235, 260], // 3h 55m - 4h 20m

  // === ATL (Atlanta) Routes ===
  "ATL-LAX": [255, 285], // 4h 15m - 4h 45m
  "LAX-ATL": [225, 255], // 3h 45m - 4h 15m
  "ATL-SFO": [280, 310], // 4h 40m - 5h 10m
  "SFO-ATL": [250, 280], // 4h 10m - 4h 40m
  "ATL-ORD": [105, 125], // 1h 45m - 2h 5m
  "ORD-ATL": [100, 120], // 1h 40m - 2h
  "ATL-MIA": [100, 120], // 1h 40m - 2h
  "MIA-ATL": [95, 115], // 1h 35m - 1h 55m
  "ATL-DFW": [135, 160], // 2h 15m - 2h 40m
  "DFW-ATL": [125, 150], // 2h 5m - 2h 30m
  "ATL-DEN": [195, 220], // 3h 15m - 3h 40m
  "DEN-ATL": [175, 200], // 2h 55m - 3h 20m
  "ATL-SEA": [285, 315], // 4h 45m - 5h 15m
  "SEA-ATL": [260, 290], // 4h 20m - 4h 50m
  "ATL-LAS": [245, 275], // 4h 5m - 4h 35m
  "LAS-ATL": [220, 250], // 3h 40m - 4h 10m
  "ATL-PHX": [225, 255], // 3h 45m - 4h 15m
  "PHX-ATL": [200, 230], // 3h 20m - 3h 50m

  // === ORD (Chicago) Routes ===
  "ORD-LAX": [240, 270], // 4h - 4h 30m
  "LAX-ORD": [210, 240], // 3h 30m - 4h
  "ORD-SFO": [255, 285], // 4h 15m - 4h 45m
  "SFO-ORD": [230, 260], // 3h 50m - 4h 20m
  "ORD-MIA": [175, 200], // 2h 55m - 3h 20m
  "MIA-ORD": [175, 200], // 2h 55m - 3h 20m
  "ORD-DFW": [135, 160], // 2h 15m - 2h 40m
  "DFW-ORD": [125, 150], // 2h 5m - 2h 30m
  "ORD-DEN": [140, 165], // 2h 20m - 2h 45m
  "DEN-ORD": [125, 150], // 2h 5m - 2h 30m
  "ORD-SEA": [240, 270], // 4h - 4h 30m
  "SEA-ORD": [225, 255], // 3h 45m - 4h 15m
  "ORD-LAS": [215, 245], // 3h 35m - 4h 5m
  "LAS-ORD": [195, 225], // 3h 15m - 3h 45m
  "ORD-PHX": [200, 230], // 3h 20m - 3h 50m
  "PHX-ORD": [185, 215], // 3h 5m - 3h 35m
  "ORD-MSP": [70, 90], // 1h 10m - 1h 30m
  "MSP-ORD": [65, 85], // 1h 5m - 1h 25m

  // === DFW (Dallas) Routes ===
  "DFW-LAX": [185, 215], // 3h 5m - 3h 35m
  "LAX-DFW": [170, 200], // 2h 50m - 3h 20m
  "DFW-SFO": [210, 240], // 3h 30m - 4h
  "SFO-DFW": [190, 220], // 3h 10m - 3h 40m
  "DFW-MIA": [160, 185], // 2h 40m - 3h 5m
  "MIA-DFW": [155, 180], // 2h 35m - 3h
  "DFW-DEN": [115, 140], // 1h 55m - 2h 20m
  "DEN-DFW": [105, 130], // 1h 45m - 2h 10m
  "DFW-SEA": [235, 265], // 3h 55m - 4h 25m
  "SEA-DFW": [215, 245], // 3h 35m - 4h 5m
  "DFW-LAS": [170, 200], // 2h 50m - 3h 20m
  "LAS-DFW": [160, 190], // 2h 40m - 3h 10m
  "DFW-PHX": [140, 170], // 2h 20m - 2h 50m
  "PHX-DFW": [130, 160], // 2h 10m - 2h 40m

  // === MIA (Miami) Routes ===
  "MIA-LAX": [295, 325], // 4h 55m - 5h 25m
  "LAX-MIA": [280, 310], // 4h 40m - 5h 10m
  "MIA-SFO": [325, 355], // 5h 25m - 5h 55m
  "SFO-MIA": [305, 335], // 5h 5m - 5h 35m
  "MIA-DEN": [230, 260], // 3h 50m - 4h 20m
  "DEN-MIA": [215, 245], // 3h 35m - 4h 5m
  "MIA-SEA": [340, 370], // 5h 40m - 6h 10m
  "SEA-MIA": [320, 350], // 5h 20m - 5h 50m
  "MIA-LAS": [280, 310], // 4h 40m - 5h 10m
  "LAS-MIA": [265, 295], // 4h 25m - 4h 55m
  "MIA-PHX": [255, 285], // 4h 15m - 4h 45m
  "PHX-MIA": [240, 270], // 4h - 4h 30m

  // === DEN (Denver) Routes ===
  "DEN-LAX": [145, 175], // 2h 25m - 2h 55m
  "LAX-DEN": [130, 160], // 2h 10m - 2h 40m
  "DEN-SFO": [150, 180], // 2h 30m - 3h
  "SFO-DEN": [135, 165], // 2h 15m - 2h 45m
  "DEN-SEA": [155, 185], // 2h 35m - 3h 5m
  "SEA-DEN": [140, 170], // 2h 20m - 2h 50m
  "DEN-LAS": [100, 125], // 1h 40m - 2h 5m
  "LAS-DEN": [95, 120], // 1h 35m - 2h
  "DEN-PHX": [105, 130], // 1h 45m - 2h 10m
  "PHX-DEN": [100, 125], // 1h 40m - 2h 5m
  "DEN-MSP": [120, 145], // 2h - 2h 25m
  "MSP-DEN": [130, 155], // 2h 10m - 2h 35m

  // === West Coast Routes ===
  "LAX-SFO": [70, 90], // 1h 10m - 1h 30m
  "SFO-LAX": [70, 90], // 1h 10m - 1h 30m
  "LAX-SEA": [155, 180], // 2h 35m - 3h
  "SEA-LAX": [145, 170], // 2h 25m - 2h 50m
  "LAX-LAS": [55, 75], // 55m - 1h 15m
  "LAS-LAX": [55, 75], // 55m - 1h 15m
  "LAX-PHX": [65, 85], // 1h 5m - 1h 25m
  "PHX-LAX": [60, 80], // 1h - 1h 20m
  "LAX-PDX": [140, 165], // 2h 20m - 2h 45m
  "PDX-LAX": [135, 160], // 2h 15m - 2h 40m
  "LAX-SAN": [45, 60], // 45m - 1h
  "SAN-LAX": [45, 60], // 45m - 1h
  "SFO-SEA": [115, 140], // 1h 55m - 2h 20m
  "SEA-SFO": [105, 130], // 1h 45m - 2h 10m
  "SFO-LAS": [80, 100], // 1h 20m - 1h 40m
  "LAS-SFO": [80, 100], // 1h 20m - 1h 40m
  "SFO-PHX": [100, 125], // 1h 40m - 2h 5m
  "PHX-SFO": [95, 120], // 1h 35m - 2h
  "SFO-PDX": [95, 120], // 1h 35m - 2h
  "PDX-SFO": [95, 120], // 1h 35m - 2h
  "SEA-LAS": [155, 180], // 2h 35m - 3h
  "LAS-SEA": [160, 185], // 2h 40m - 3h 5m
  "SEA-PHX": [175, 200], // 2h 55m - 3h 20m
  "PHX-SEA": [185, 210], // 3h 5m - 3h 30m
  "SEA-PDX": [50, 65], // 50m - 1h 5m
  "PDX-SEA": [50, 65], // 50m - 1h 5m
  "LAS-PHX": [55, 75], // 55m - 1h 15m
  "PHX-LAS": [55, 75], // 55m - 1h 15m

  // === MSP (Minneapolis) Routes ===
  "MSP-LAX": [225, 255], // 3h 45m - 4h 15m
  "LAX-MSP": [200, 230], // 3h 20m - 3h 50m
  "MSP-SFO": [235, 265], // 3h 55m - 4h 25m
  "SFO-MSP": [210, 240], // 3h 30m - 4h
  "MSP-SEA": [195, 225], // 3h 15m - 3h 45m
  "SEA-MSP": [180, 210], // 3h - 3h 30m
  "MSP-PHX": [180, 210], // 3h - 3h 30m
  "PHX-MSP": [170, 200], // 2h 50m - 3h 20m
  "MSP-LAS": [190, 220], // 3h 10m - 3h 40m
  "LAS-MSP": [180, 210], // 3h - 3h 30m
  "MSP-MIA": [200, 230], // 3h 20m - 3h 50m
  "MIA-MSP": [195, 225], // 3h 15m - 3h 45m
  "MSP-ATL": [140, 165], // 2h 20m - 2h 45m
  "ATL-MSP": [135, 160], // 2h 15m - 2h 40m
  "MSP-DFW": [145, 170], // 2h 25m - 2h 50m
  "DFW-MSP": [140, 165], // 2h 20m - 2h 45m

  // === IAH (Houston) Routes ===
  "IAH-LAX": [195, 225], // 3h 15m - 3h 45m
  "LAX-IAH": [180, 210], // 3h - 3h 30m
  "IAH-SFO": [225, 255], // 3h 45m - 4h 15m
  "SFO-IAH": [205, 235], // 3h 25m - 3h 55m
  "IAH-ORD": [145, 170], // 2h 25m - 2h 50m
  "ORD-IAH": [155, 180], // 2h 35m - 3h
  "IAH-MIA": [155, 180], // 2h 35m - 3h
  "MIA-IAH": [150, 175], // 2h 30m - 2h 55m
  "IAH-DEN": [135, 160], // 2h 15m - 2h 40m
  "DEN-IAH": [125, 150], // 2h 5m - 2h 30m
  "IAH-SEA": [250, 280], // 4h 10m - 4h 40m
  "SEA-IAH": [235, 265], // 3h 55m - 4h 25m
  "IAH-ATL": [100, 125], // 1h 40m - 2h 5m
  "ATL-IAH": [100, 125], // 1h 40m - 2h 5m
  "IAH-LAS": [195, 225], // 3h 15m - 3h 45m
  "LAS-IAH": [180, 210], // 3h - 3h 30m
  "IAH-PHX": [160, 190], // 2h 40m - 3h 10m
  "PHX-IAH": [150, 180], // 2h 30m - 3h

  // === Transatlantic Routes ===
  "JFK-LHR": [420, 450], // 7h - 7h 30m
  "LHR-JFK": [480, 510], // 8h - 8h 30m (headwinds)
  "JFK-CDG": [435, 465], // 7h 15m - 7h 45m
  "CDG-JFK": [495, 525], // 8h 15m - 8h 45m
  "JFK-FCO": [510, 540], // 8h 30m - 9h
  "FCO-JFK": [570, 600], // 9h 30m - 10h
  "BOS-LHR": [390, 420], // 6h 30m - 7h
  "LHR-BOS": [450, 480], // 7h 30m - 8h
  "LAX-LHR": [600, 630], // 10h - 10h 30m
  "LHR-LAX": [660, 690], // 11h - 11h 30m
  "MIA-LHR": [510, 540], // 8h 30m - 9h
  "LHR-MIA": [570, 600], // 9h 30m - 10h
  "ORD-LHR": [450, 480], // 7h 30m - 8h
  "LHR-ORD": [510, 540], // 8h 30m - 9h
  "ATL-LHR": [480, 510], // 8h - 8h 30m
  "LHR-ATL": [540, 570], // 9h - 9h 30m
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const from = searchParams.get("from")?.toUpperCase() || ""
  const to = searchParams.get("to")?.toUpperCase() || ""

  if (!from || !to) {
    return NextResponse.json({ error: "Missing from or to airport" }, { status: 400 })
  }

  const routeKey = `${from}-${to}`

  // Check if we have the duration in our database
  if (ACCURATE_FLIGHT_DURATIONS[routeKey]) {
    const [min, max] = ACCURATE_FLIGHT_DURATIONS[routeKey]
    return NextResponse.json({
      route: routeKey,
      minMinutes: min,
      maxMinutes: max,
      source: "database",
    })
  }

  // For routes not in our database, calculate based on distance
  const distance = calculateDistance(from, to)
  if (distance > 0) {
    // Average cruise speed 500 mph, add 30 min for taxi/climb/descent
    const baseTime = Math.round((distance / 500) * 60) + 30
    const minTime = Math.round(baseTime * 0.95)
    const maxTime = Math.round(baseTime * 1.1)

    return NextResponse.json({
      route: routeKey,
      minMinutes: minTime,
      maxMinutes: maxTime,
      source: "calculated",
    })
  }

  return NextResponse.json({
    route: routeKey,
    minMinutes: 120,
    maxMinutes: 180,
    source: "fallback",
  })
}

const AIRPORT_COORDINATES: { [key: string]: { lat: number; lon: number } } = {
  JFK: { lat: 40.6413, lon: -73.7781 },
  BOS: { lat: 42.3656, lon: -71.0096 },
  ATL: { lat: 33.6407, lon: -84.4277 },
  MIA: { lat: 25.7959, lon: -80.287 },
  ORD: { lat: 41.9742, lon: -87.9073 },
  DFW: { lat: 32.8975, lon: -97.0382 },
  IAH: { lat: 29.6575, lon: -95.2808 },
  MSP: { lat: 44.882, lon: -93.2169 },
  DEN: { lat: 39.8561, lon: -104.6737 },
  PHX: { lat: 33.7298, lon: -112.1581 },
  LAX: { lat: 33.9425, lon: -118.4081 },
  SFO: { lat: 37.6213, lon: -122.379 },
  SEA: { lat: 47.4502, lon: -122.3088 },
  LAS: { lat: 36.0801, lon: -115.1537 },
  PDX: { lat: 45.5887, lon: -122.5975 },
  SAN: { lat: 32.7336, lon: -117.1897 },
  LHR: { lat: 51.47, lon: -0.4543 },
  CDG: { lat: 49.0097, lon: 2.5479 },
  FCO: { lat: 41.8003, lon: 12.2389 },
}

function calculateDistance(from: string, to: string): number {
  const fromCoord = AIRPORT_COORDINATES[from]
  const toCoord = AIRPORT_COORDINATES[to]

  if (!fromCoord || !toCoord) return 0

  const R = 3959
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
