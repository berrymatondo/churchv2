import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import type { CreateEgliseData } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const villeId = searchParams.get("villeId") ? Number.parseInt(searchParams.get("villeId")!) : undefined

    const result = await dbService.getAllEglises(page, limit, villeId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching churches:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch churches" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateEgliseData = await request.json()

    if (!body.nom || body.nom.trim() === "") {
      return NextResponse.json({ success: false, error: "Church name is required" }, { status: 400 })
    }

    if (!body.adresse || body.adresse.trim() === "") {
      return NextResponse.json({ success: false, error: "Church address is required" }, { status: 400 })
    }

    if (!body.villeId) {
      return NextResponse.json({ success: false, error: "City ID is required" }, { status: 400 })
    }

    const newEglise = await dbService.createEglise(body)
    return NextResponse.json({ success: true, data: newEglise }, { status: 201 })
  } catch (error) {
    console.error("Error creating church:", error)
    return NextResponse.json({ success: false, error: "Failed to create church" }, { status: 500 })
  }
}
