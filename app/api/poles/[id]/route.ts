import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import type { CreatePoleData } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid pole ID" }, { status: 400 })
    }

    const pole = await dbService.getPoleById(id)
    if (!pole) {
      return NextResponse.json({ success: false, error: "Pole not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: pole })
  } catch (error) {
    console.error("Error fetching pole:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch pole" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid pole ID" }, { status: 400 })
    }

    const body: Partial<CreatePoleData> = await request.json()

    if (body.nom && body.nom.trim() === "") {
      return NextResponse.json({ success: false, error: "Pole name cannot be empty" }, { status: 400 })
    }

    const updatedPole = await dbService.updatePole(id, body)
    if (!updatedPole) {
      return NextResponse.json({ success: false, error: "Pole not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updatedPole })
  } catch (error) {
    console.error("Error updating pole:", error)
    return NextResponse.json({ success: false, error: "Failed to update pole" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid pole ID" }, { status: 400 })
    }

    const deleted = await dbService.deletePole(id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Pole not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Pole deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting pole:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to delete pole" }, { status: 500 })
  }
}
