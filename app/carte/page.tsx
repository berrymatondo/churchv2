"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { LeafletMap } from "@/components/leaflet-map"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Search, Filter } from "lucide-react"
import type { Eglise, Ville, Pays } from "@/lib/types"

export default function CartePage() {
  const [eglises, setEglises] = useState<Eglise[]>([])
  const [villes, setVilles] = useState<Ville[]>([])
  const [pays, setPays] = useState<Pays[]>([])
  const [selectedEglise, setSelectedEglise] = useState<Eglise | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVille, setSelectedVille] = useState<string>("")
  const [selectedPays, setSelectedPays] = useState<string>("")
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      const [eglisesResponse, villesResponse, paysResponse] = await Promise.all([
        fetch("/api/eglises"),
        fetch("/api/villes"),
        fetch("/api/pays"),
      ])

      const [eglisesResult, villesResult, paysResult] = await Promise.all([
        eglisesResponse.json(),
        villesResponse.json(),
        paysResponse.json(),
      ])

      if (eglisesResult.success) setEglises(eglisesResult.data)
      if (villesResult.success) setVilles(villesResult.data)
      if (paysResult.success) setPays(paysResult.data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter churches based on search and filters
  const filteredEglises = eglises.filter((eglise) => {
    const matchesSearch =
      eglise.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eglise.adresse.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesVille = !selectedVille || eglise.villeId.toString() === selectedVille
    const matchesPays = !selectedPays || eglise.ville?.paysId.toString() === selectedPays

    return matchesSearch && matchesVille && matchesPays
  })

  // Only show churches with coordinates on map
  const eglisesWithCoordinates = filteredEglises.filter((eglise) => eglise.latitude && eglise.longitude)

  const eglisesSansCoordinates = filteredEglises.filter((eglise) => !eglise.latitude || !eglise.longitude)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Carte des Églises</h1>
          <p className="text-muted-foreground">
            Visualisez la localisation de toutes les églises de votre organisation
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtres</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nom ou adresse..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pays</label>
                <Select value={selectedPays} onValueChange={setSelectedPays}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les pays</SelectItem>
                    {pays.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ville</label>
                <Select value={selectedVille} onValueChange={setSelectedVille}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les villes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    {villes
                      .filter((v) => !selectedPays || v.paysId.toString() === selectedPays)
                      .map((v) => (
                        <SelectItem key={v.id} value={v.id.toString()}>
                          {v.nom}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4">
              <Badge variant="secondary">
                {eglisesWithCoordinates.length} église{eglisesWithCoordinates.length !== 1 ? "s" : ""} sur la carte
              </Badge>
              {eglisesSansCoordinates.length > 0 && (
                <Badge variant="outline">{eglisesSansCoordinates.length} sans coordonnées</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <LeafletMap
              eglises={eglisesWithCoordinates}
              selectedEglise={selectedEglise}
              onEgliseSelect={setSelectedEglise}
              height="600px"
            />
          </div>

          {/* Church Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Églises sur la Carte</span>
                </CardTitle>
                <CardDescription>
                  {eglisesWithCoordinates.length} église{eglisesWithCoordinates.length !== 1 ? "s" : ""} géolocalisée
                  {eglisesWithCoordinates.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {eglisesWithCoordinates.map((eglise) => (
                    <div
                      key={eglise.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors hover:bg-muted ${
                        selectedEglise?.id === eglise.id ? "bg-primary/10 border-primary" : ""
                      }`}
                      onClick={() => setSelectedEglise(eglise)}
                    >
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{eglise.nom}</div>
                          <div className="text-xs text-muted-foreground truncate">{eglise.adresse}</div>
                          <div className="text-xs text-muted-foreground">
                            {eglise.ville?.nom}, {eglise.ville?.pays?.nom}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {eglisesWithCoordinates.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      Aucune église trouvée avec les filtres actuels
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedEglise ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>Détails de l'Église</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedEglise.nom}</h3>
                    <p className="text-muted-foreground">{selectedEglise.adresse}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Ville:</span>
                      <span className="text-sm">{selectedEglise.ville?.nom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Pays:</span>
                      <span className="text-sm">{selectedEglise.ville?.pays?.nom}</span>
                    </div>
                    {selectedEglise.latitude && selectedEglise.longitude && (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Latitude:</span>
                          <span className="text-sm font-mono">{selectedEglise.latitude.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Longitude:</span>
                          <span className="text-sm font-mono">{selectedEglise.longitude.toFixed(6)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => setSelectedEglise(null)}>
                    Fermer
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Sélectionnez une Église</CardTitle>
                  <CardDescription>
                    Cliquez sur un marqueur sur la carte pour voir les détails de l'église
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Churches without coordinates */}
            {eglisesSansCoordinates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">Églises sans Coordonnées</CardTitle>
                  <CardDescription>
                    Ces églises n'apparaissent pas sur la carte car elles n'ont pas de coordonnées GPS
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {eglisesSansCoordinates.map((eglise) => (
                      <div key={eglise.id} className="p-2 border rounded-md">
                        <div className="font-medium text-sm">{eglise.nom}</div>
                        <div className="text-xs text-muted-foreground">{eglise.ville?.nom}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
