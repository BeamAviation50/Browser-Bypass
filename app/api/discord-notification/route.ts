import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      pilotName,
      flightNumber,
      aircraft,
      confirmationNumber,
      departure,
      arrival,
      departureTimeZone,
      arrivalTimeZone,
      departureTime,
      arrivalTime,
      customCallsign,
    } = body

    if (!flightNumber || !aircraft || !confirmationNumber || !departure || !arrival || !departureTime || !arrivalTime) {
      console.error("[v0] Missing required fields for Discord notification")
      return NextResponse.json({ error: "Missing required flight details" }, { status: 400 })
    }

    const pilotNameValue = body.pilotName || "TBD"

    // Get Discord webhook URL from environment variables
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL

    if (!webhookUrl) {
      console.error("[v0] DISCORD_WEBHOOK_URL not configured")
      return NextResponse.json({ error: "Discord notification not configured" }, { status: 500 })
    }

    // Send to Discord webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            color: 0x00d4ff,
            title: "✈️ New Flight Briefing!",
            fields: [
              { name: "Pilot Name", value: String(pilotNameValue).trim() || "N/A", inline: true },
              ...(customCallsign ? [{ name: "Callsign", value: String(customCallsign).trim(), inline: true }] : []),
              { name: "Flight Number", value: String(flightNumber).trim() || "N/A", inline: true },
              { name: "Aircraft", value: String(aircraft).trim() || "N/A", inline: true },
              { name: "Departure", value: String(departure).trim() || "N/A", inline: true },
              {
                name: "Departure Time",
                value: `${String(departureTime).trim() || "N/A"} ${String(departureTimeZone || "UTC").trim()}`,
                inline: true,
              },
              { name: "Arrival", value: String(arrival).trim() || "N/A", inline: true },
              {
                name: "Arrival Time",
                value: `${String(arrivalTime).trim() || "N/A"} ${String(arrivalTimeZone || "UTC").trim()}`,
                inline: true,
              },
              { name: "Confirmation #", value: String(confirmationNumber).trim() || "N/A", inline: false },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "Lightning Airways Pilot Briefing" },
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error(`[v0] Discord webhook failed: ${response.status}`, errorData)
      throw new Error(`Discord webhook failed: ${response.status}`)
    }

    console.log("[v0] Pilot briefing notification posted to Discord webhook")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in Discord notification:", error)
    return NextResponse.json({ error: "Failed to post notification" }, { status: 500 })
  }
}
