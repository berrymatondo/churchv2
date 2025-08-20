import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import type { CreatePoleData } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const departementId = searchParams.get("departementId")
      ? Number.parseInt(searchParams.get("departementId")!)
      : undefined

    const result = await dbService.getAllPoles(page, limit, departementId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching poles:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch poles" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePoleData = await request.json()

    if (!body.nom || body.nom.trim() === "") {
      return NextResponse.json({ success: false, error: "Pole name is required" }, { status: 400 })
    }

    if (!body.departementId) {
      return NextResponse.json({ success: false, error: "Department ID is required" }, { status: 400 })
    }

    const newPole = await dbService.createPole(body)
    return NextResponse.json({ success: true, data: newPole }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating pole:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to create pole" }, { status: 500 })
  }
}
