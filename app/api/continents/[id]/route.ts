import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import type { CreateContinentData } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (Number.isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid continent ID" }, { status: 400 })
    }

    const continent = await dbService.getContinentById(id)
    if (!continent) {
      return NextResponse.json({ success: false, error: "Continent not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: continent })
  } catch (error) {
    console.error("Error fetching continent:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch continent" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (Number.isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid continent ID" }, { status: 400 })
    }

    const body: CreateContinentData = await request.json()

    if (!body.nom || body.nom.trim() === "") {
      return NextResponse.json({ success: false, error: "Continent name is required" }, { status: 400 })
    }

    const updatedContinent = await dbService.updateContinent(id, body)
    if (!updatedContinent) {
      return NextResponse.json({ success: false, error: "Continent not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updatedContinent })
  } catch (error) {
    console.error("Error updating continent:", error)
    return NextResponse.json({ success: false, error: "Failed to update continent" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (Number.isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid continent ID" }, { status: 400 })
    }

    const success = await dbService.deleteContinent(id)
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Continent not found or has associated countries" },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting continent:", error)
    return NextResponse.json({ success: false, error: "Failed to delete continent" }, { status: 500 })
  }
}
