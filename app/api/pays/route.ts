import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import type { CreatePaysData } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const result = await dbService.getAllPays(page, limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching countries:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch countries" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaysData = await request.json()

    if (!body.nom || body.nom.trim() === "") {
      return NextResponse.json({ success: false, error: "Country name is required" }, { status: 400 })
    }

    const newPays = await dbService.createPays(body)
    return NextResponse.json({ success: true, data: newPays }, { status: 201 })
  } catch (error) {
    console.error("Error creating country:", error)
    return NextResponse.json({ success: false, error: "Failed to create country" }, { status: 500 })
  }
}
