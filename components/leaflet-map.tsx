"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Maximize2 } from "lucide-react"
import type { Eglise } from "@/lib/types"

interface LeafletMapProps {
  eglises: Eglise[]
  selectedEglise?: Eglise | null
  onEgliseSelect?: (eglise: Eglise) => void
  onCoordinatesSelect?: (lat: number, lng: number) => void
  height?: string
  showControls?: boolean
  center?: [number, number]
  zoom?: number
}

export function LeafletMap({
  eglises,
  selectedEglise,
  onEgliseSelect,
  onCoordinatesSelect,
  height = "400px",
  showControls = true,
  center = [46.603354, 1.888334], // Centre de la France
  zoom = 6,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [leafletLib, setLeafletLib] = useState<any>(null) // Store Leaflet library reference
  const [hasInitialZoom, setHasInitialZoom] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadLeaflet = async () => {
      if (typeof window === "undefined") return

      try {
        console.log("[v0] Loading Leaflet...")

        // Dynamically import Leaflet
        const L = await import("leaflet")
        console.log("[v0] Leaflet loaded:", L)

        if (!isMounted) return

        setLeafletLib(L)

        // Import Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
        }

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })

        if (!mapRef.current) return

        console.log("[v0] Initializing map...")

        // Initialize map
        const map = L.map(mapRef.current).setView(center, zoom)

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        mapInstanceRef.current = map
        console.log("[v0] Map initialized successfully")

        // Add click handler for coordinate selection
        if (onCoordinatesSelect) {
          map.on("click", (e: any) => {
            onCoordinatesSelect(e.latlng.lat, e.latlng.lng)
          })
        }

        setIsLoaded(true)
      } catch (error) {
        console.error("[v0] Error loading Leaflet:", error)
      }
    }

    loadLeaflet()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [center, zoom, onCoordinatesSelect])

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !leafletLib) {
      console.log("[v0] Not ready for markers:", {
        isLoaded,
        hasMap: !!mapInstanceRef.current,
        hasLeaflet: !!leafletLib,
      })
      return
    }

    console.log("[v0] Updating markers for", eglises.length, "churches")

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      try {
        mapInstanceRef.current.removeLayer(marker)
      } catch (error) {
        console.warn("[v0] Error removing marker:", error)
      }
    })
    markersRef.current = []

    // Add new markers
    eglises.forEach((eglise) => {
      if (eglise.latitude && eglise.longitude) {
        try {
          console.log("[v0] Adding marker for church:", eglise.nom, "at", eglise.latitude, eglise.longitude)

          const marker = leafletLib
            .marker([eglise.latitude, eglise.longitude])
            .addTo(mapInstanceRef.current)
            .bindPopup(
              `<div class="p-2">
                <h3 class="font-semibold">${eglise.nom}</h3>
                <p class="text-sm text-gray-600">${eglise.adresse}</p>
                <p class="text-xs text-gray-500">${eglise.ville?.nom || "Ville inconnue"}, ${eglise.ville?.pays?.nom || "Pays inconnu"}</p>
              </div>`,
            )

          if (onEgliseSelect) {
            marker.on("click", () => onEgliseSelect(eglise))
          }

          markersRef.current.push(marker)
          console.log("[v0] Marker added successfully for:", eglise.nom)
        } catch (error) {
          console.error("[v0] Error adding marker for church:", eglise.nom, error)
        }
      } else {
        console.log("[v0] Church without coordinates:", eglise.nom)
      }
    })

    console.log("[v0] Total markers added:", markersRef.current.length)

    if (markersRef.current.length > 0 && !hasInitialZoom) {
      try {
        const firstChurch = eglises.find((e) => e.latitude && e.longitude)
        if (firstChurch && firstChurch.latitude && firstChurch.longitude) {
          mapInstanceRef.current.setView([firstChurch.latitude, firstChurch.longitude], 13)
          console.log("[v0] Applied default zoom to first church:", firstChurch.nom)
          setHasInitialZoom(true)
        }
      } catch (error) {
        console.error("[v0] Error applying default zoom:", error)
      }
    }
    // Fit bounds if there are markers (but only if no initial zoom applied)
    else if (markersRef.current.length > 0 && hasInitialZoom) {
      try {
        const group = new leafletLib.featureGroup(markersRef.current)
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
        console.log("[v0] Map bounds fitted to markers")
      } catch (error) {
        console.error("[v0] Error fitting bounds:", error)
      }
    }
  }, [eglises, isLoaded, onEgliseSelect, leafletLib, hasInitialZoom])

  // Highlight selected church
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !selectedEglise) return

    if (selectedEglise.latitude && selectedEglise.longitude) {
      mapInstanceRef.current.setView([selectedEglise.latitude, selectedEglise.longitude], 15)
    }
  }, [selectedEglise, isLoaded])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Localisation des Églises</span>
          </CardTitle>
          {showControls && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (mapInstanceRef.current && markersRef.current.length > 0 && leafletLib) {
                  const group = new leafletLib.featureGroup(markersRef.current)
                  mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
                }
              }}
            >
              <Maximize2 className="h-4 w-4 mr-1" />
              Voir tout
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} style={{ height, width: "100%" }} className="rounded-md border bg-muted" />
        {onCoordinatesSelect && (
          <p className="text-xs text-muted-foreground mt-2">Cliquez sur la carte pour sélectionner des coordonnées</p>
        )}
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>
            {isLoaded
              ? `${markersRef.current.length} église${markersRef.current.length !== 1 ? "s" : ""} affichée${markersRef.current.length !== 1 ? "s" : ""}`
              : "Chargement de la carte..."}
          </span>
          {!isLoaded && <span>Initialisation de Leaflet...</span>}
        </div>
      </CardContent>
    </Card>
  )
}
