import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import type { CreateDepartementData } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const egliseId = searchParams.get("egliseId") ? Number.parseInt(searchParams.get("egliseId")!) : undefined

    const result = await dbService.getAllDepartements(page, limit, egliseId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch departments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateDepartementData = await request.json()

    if (!body.nom || body.nom.trim() === "") {
      return NextResponse.json({ success: false, error: "Department name is required" }, { status: 400 })
    }

    if (!body.acronyme || body.acronyme.trim() === "") {
      return NextResponse.json({ success: false, error: "Department acronym is required" }, { status: 400 })
    }

    if (!body.egliseId) {
      return NextResponse.json({ success: false, error: "Church ID is required" }, { status: 400 })
    }

    const newDepartement = await dbService.createDepartement(body)
    return NextResponse.json({ success: true, data: newDepartement }, { status: 201 })
  } catch (error) {
    console.error("Error creating department:", error)
    return NextResponse.json({ success: false, error: "Failed to create department" }, { status: 500 })
  }
}
