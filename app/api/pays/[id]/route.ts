import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import type { CreatePaysData } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid country ID" }, { status: 400 })
    }

    const pays = await dbService.getPaysById(id)
    if (!pays) {
      return NextResponse.json({ success: false, error: "Country not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: pays })
  } catch (error) {
    console.error("Error fetching country:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch country" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid country ID" }, { status: 400 })
    }

    const body: Partial<CreatePaysData> = await request.json()

    if (body.nom && body.nom.trim() === "") {
      return NextResponse.json({ success: false, error: "Country name cannot be empty" }, { status: 400 })
    }

    const updatedPays = await dbService.updatePays(id, body)
    if (!updatedPays) {
      return NextResponse.json({ success: false, error: "Country not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updatedPays })
  } catch (error) {
    console.error("Error updating country:", error)
    return NextResponse.json({ success: false, error: "Failed to update country" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid country ID" }, { status: 400 })
    }

    const deleted = await dbService.deletePays(id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Country not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Country deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting country:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to delete country" }, { status: 500 })
  }
}
