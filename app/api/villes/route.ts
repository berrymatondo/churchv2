import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import type { CreateVilleData } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const paysId = searchParams.get("paysId") ? Number.parseInt(searchParams.get("paysId")!) : undefined

    const result = await dbService.getAllVilles(page, limit, paysId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching cities:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch cities" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateVilleData = await request.json()

    if (!body.nom || body.nom.trim() === "") {
      return NextResponse.json({ success: false, error: "City name is required" }, { status: 400 })
    }

    if (!body.paysId) {
      return NextResponse.json({ success: false, error: "Country ID is required" }, { status: 400 })
    }

    const newVille = await dbService.createVille(body)
    return NextResponse.json({ success: true, data: newVille }, { status: 201 })
  } catch (error) {
    console.error("Error creating city:", error)
    return NextResponse.json({ success: false, error: "Failed to create city" }, { status: 500 })
  }
}
