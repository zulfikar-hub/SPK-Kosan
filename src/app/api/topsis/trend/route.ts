import { NextResponse } from "next/server"

export async function GET() {
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ]

  const data = months.map(m => ({
    month: m,
    alternatives: Math.floor(Math.random() * 10) + 5,
    ratings: Math.floor(Math.random() * 50) + 10
  }))

  return NextResponse.json(data)
}
