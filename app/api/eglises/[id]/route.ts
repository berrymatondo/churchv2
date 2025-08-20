import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import type { CreateEgliseData } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid church ID" }, { status: 400 })
    }

    const eglise = await dbService.getEgliseById(id)
    if (!eglise) {
      return NextResponse.json({ success: false, error: "Church not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: eglise })
  } catch (error) {
    console.error("Error fetching church:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch church" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid church ID" }, { status: 400 })
    }

    const body: Partial<CreateEgliseData> = await request.json()

    if (body.nom && body.nom.trim() === "") {
      return NextResponse.json({ success: false, error: "Church name cannot be empty" }, { status: 400 })
    }

    if (body.adresse && body.adresse.trim() === "") {
      return NextResponse.json({ success: false, error: "Church address cannot be empty" }, { status: 400 })
    }

    const updatedEglise = await dbService.updateEglise(id, body)
    if (!updatedEglise) {
      return NextResponse.json({ success: false, error: "Church not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updatedEglise })
  } catch (error) {
    console.error("Error updating church:", error)
    return NextResponse.json({ success: false, error: "Failed to update church" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid church ID" }, { status: 400 })
    }

    const deleted = await dbService.deleteEglise(id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Church not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Church deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting church:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to delete church" }, { status: 500 })
  }
}
