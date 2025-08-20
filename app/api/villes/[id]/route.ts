import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import type { CreateVilleData } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid city ID" }, { status: 400 })
    }

    const ville = await dbService.getVilleById(id)
    if (!ville) {
      return NextResponse.json({ success: false, error: "City not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: ville })
  } catch (error) {
    console.error("Error fetching city:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch city" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid city ID" }, { status: 400 })
    }

    const body: Partial<CreateVilleData> = await request.json()

    if (body.nom && body.nom.trim() === "") {
      return NextResponse.json({ success: false, error: "City name cannot be empty" }, { status: 400 })
    }

    const updatedVille = await dbService.updateVille(id, body)
    if (!updatedVille) {
      return NextResponse.json({ success: false, error: "City not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updatedVille })
  } catch (error) {
    console.error("Error updating city:", error)
    return NextResponse.json({ success: false, error: "Failed to update city" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid city ID" }, { status: 400 })
    }

    const deleted = await dbService.deleteVille(id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: "City not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "City deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting city:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to delete city" }, { status: 500 })
  }
}
