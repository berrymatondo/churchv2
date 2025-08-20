import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import type { CreateDepartementData } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid department ID" }, { status: 400 })
    }

    const departement = await dbService.getDepartementById(id)
    if (!departement) {
      return NextResponse.json({ success: false, error: "Department not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: departement })
  } catch (error) {
    console.error("Error fetching department:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch department" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid department ID" }, { status: 400 })
    }

    const body: Partial<CreateDepartementData> = await request.json()

    if (body.nom && body.nom.trim() === "") {
      return NextResponse.json({ success: false, error: "Department name cannot be empty" }, { status: 400 })
    }

    if (body.acronyme && body.acronyme.trim() === "") {
      return NextResponse.json({ success: false, error: "Department acronym cannot be empty" }, { status: 400 })
    }

    const updatedDepartement = await dbService.updateDepartement(id, body)
    if (!updatedDepartement) {
      return NextResponse.json({ success: false, error: "Department not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updatedDepartement })
  } catch (error) {
    console.error("Error updating department:", error)
    return NextResponse.json({ success: false, error: "Failed to update department" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid department ID" }, { status: 400 })
    }

    const deleted = await dbService.deleteDepartement(id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Department not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Department deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting department:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to delete department" }, { status: 500 })
  }
}
