import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import type { CreateContinentData } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const result = await dbService.getAllContinents(page, limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching continents:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch continents" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateContinentData = await request.json()

    if (!body.nom || body.nom.trim() === "") {
      return NextResponse.json({ success: false, error: "Continent name is required" }, { status: 400 })
    }

    const newContinent = await dbService.createContinent(body)
    return NextResponse.json({ success: true, data: newContinent }, { status: 201 })
  } catch (error) {
    console.error("Error creating continent:", error)
    return NextResponse.json({ success: false, error: "Failed to create continent" }, { status: 500 })
  }
}
