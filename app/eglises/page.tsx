"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { DataTable } from "@/components/data-table"
import { LeafletMap } from "@/components/leaflet-map"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { Plus, Map, MapPin, Building2 } from "lucide-react"
import type { Eglise, Ville, CreateEgliseData, Departement } from "@/lib/types"
import Link from "next/link"

export default function EglisesPage() {
  const [eglises, setEglises] = useState<Eglise[]>([])
  const [villes, setVilles] = useState<Ville[]>([])
  const [departements, setDepartements] = useState<Departement[]>([])
  const [selectedEglise, setSelectedEglise] = useState<Eglise | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mobileModalOpen, setMobileModalOpen] = useState(false)
  const [editingEglise, setEditingEglise] = useState<Eglise | null>(null)
  const [formData, setFormData] = useState<CreateEgliseData>({
    nom: "",
    adresse: "",
    villeId: 0,
    latitude: undefined,
    longitude: undefined,
  })
  const { toast } = useToast()
  const isMobile = useMobile()

  const fetchData = async () => {
    try {
      const [eglisesResponse, villesResponse, departementsResponse] = await Promise.all([
        fetch("/api/eglises"),
        fetch("/api/villes"),
        fetch("/api/departements"),
      ])

      const [eglisesResult, villesResult, departementsResult] = await Promise.all([
        eglisesResponse.json(),
        villesResponse.json(),
        departementsResponse.json(),
      ])

      if (eglisesResult.success) setEglises(eglisesResult.data)
      if (villesResult.success) setVilles(villesResult.data)
      if (departementsResult.success) setDepartements(departementsResult.data)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingEglise ? `/api/eglises/${editingEglise.id}` : "/api/eglises"
      const method = editingEglise ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Succès",
          description: editingEglise ? "Église modifiée avec succès" : "Église créée avec succès",
        })
        setDialogOpen(false)
        setMobileModalOpen(false)
        setEditingEglise(null)
        setFormData({ nom: "", adresse: "", villeId: 0, latitude: undefined, longitude: undefined })
        fetchData()
      } else {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (eglise: Eglise) => {
    setEditingEglise(eglise)
    setFormData({
      nom: eglise.nom,
      adresse: eglise.adresse,
      villeId: eglise.villeId,
      latitude: eglise.latitude,
      longitude: eglise.longitude,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (eglise: Eglise) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette église ?")) return

    try {
      const response = await fetch(`/api/eglises/${eglise.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Succès",
          description: "Église supprimée avec succès",
        })
        fetchData()
      } else {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
    }
  }

  const handleCoordinatesSelect = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: Number.parseFloat(lat.toFixed(6)),
      longitude: Number.parseFloat(lng.toFixed(6)),
    })
    toast({
      title: "Coordonnées sélectionnées",
      description: `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`,
    })
  }

  const handleRowClick = (eglise: Eglise) => {
    setSelectedEglise(eglise)
    if (isMobile) {
      setMobileModalOpen(true)
    }
  }

  const columns = [
    { key: "id", label: "ID" },
    { key: "nom", label: "Nom" },
    { key: "adresse", label: "Adresse" },
    { key: "ville.nom", label: "Ville" },
    {
      key: "departements_count",
      label: "Départements",
      render: (value: any, item: Eglise) => {
        const count = departements.filter((d) => d.egliseId === item.id).length
        return (
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium text-blue-600">
              {count} département{count !== 1 ? "s" : ""}
            </span>
          </div>
        )
      },
    },
  ]

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
        <Tabs defaultValue="table" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Gestion des Églises</h1>
              <p className="text-muted-foreground">Gérez les églises et leur localisation</p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une église
            </Button>
          </div>

          <TabsList>
            <TabsTrigger value="table" className="flex items-center space-x-2">
              <span>Liste</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center space-x-2">
              <Map className="h-4 w-4" />
              <span>Carte</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Liste des Églises</CardTitle>
                    <CardDescription>Cliquez sur une ligne pour voir les détails</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      data={eglises}
                      columns={columns}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onRowClick={handleRowClick}
                      searchPlaceholder="Rechercher une église..."
                      emptyMessage="Aucune église trouvée"
                    />
                  </CardContent>
                </Card>
              </div>

              <div className={`space-y-4 ${isMobile ? "hidden" : ""}`}>
                {selectedEglise ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5" />
                        <span>Détails de l'église</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedEglise.nom}</h3>
                        <p className="text-sm text-muted-foreground">{selectedEglise.adresse}</p>
                        <p className="text-sm text-muted-foreground">
                          Ville: {selectedEglise.ville?.nom} ({selectedEglise.ville?.pays?.nom})
                        </p>
                        {selectedEglise.latitude && selectedEglise.longitude && (
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {selectedEglise.latitude.toFixed(4)}, {selectedEglise.longitude.toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">
                            Départements ({departements.filter((d) => d.egliseId === selectedEglise.id).length})
                          </h4>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/departements?eglise=${selectedEglise.id}`}>
                              <Plus className="h-3 w-3 mr-1" />
                              Ajouter
                            </Link>
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {departements
                            .filter((d) => d.egliseId === selectedEglise.id)
                            .map((departement) => (
                              <Link
                                key={departement.id}
                                href={`/departements?highlight=${departement.id}`}
                                className="block p-2 rounded border hover:bg-muted transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">{departement.nom}</p>
                                    <p className="text-xs text-muted-foreground">Acronyme: {departement.acronyme}</p>
                                  </div>
                                  <div className="text-xs text-muted-foreground">ID: {departement.id}</div>
                                </div>
                              </Link>
                            ))}
                          {departements.filter((d) => d.egliseId === selectedEglise.id).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Aucun département dans cette église
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-48">
                      <p className="text-muted-foreground">Sélectionnez une église pour voir ses détails</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="map">
            <LeafletMap eglises={eglises.filter((e) => e.latitude && e.longitude)} height="600px" />
          </TabsContent>
        </Tabs>

        <Dialog open={mobileModalOpen} onOpenChange={setMobileModalOpen}>
          <DialogContent className="w-[95vw] max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de l'Église</DialogTitle>
            </DialogHeader>
            {selectedEglise && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Nom:</span>
                    <span>{selectedEglise.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Adresse:</span>
                    <span className="text-right text-sm">{selectedEglise.adresse}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Ville:</span>
                    <span>{selectedEglise.ville?.nom}</span>
                  </div>
                  {selectedEglise.latitude && selectedEglise.longitude && (
                    <div className="flex justify-between">
                      <span className="font-medium">Coordonnées:</span>
                      <span className="text-sm">
                        {selectedEglise.latitude.toFixed(4)}, {selectedEglise.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Départements:</span>
                    <span className="text-blue-600 font-medium">
                      {departements.filter((d) => d.egliseId === selectedEglise.id).length}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Départements de cette église</h4>
                  {departements.filter((d) => d.egliseId === selectedEglise.id).length > 0 ? (
                    <div className="space-y-2">
                      {departements
                        .filter((d) => d.egliseId === selectedEglise.id)
                        .map((departement) => (
                          <div
                            key={departement.id}
                            className="p-2 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => {
                              setMobileModalOpen(false)
                              window.location.href = `/departements?highlight=${departement.id}`
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{departement.nom}</p>
                                <p className="text-xs text-muted-foreground">Acronyme: {departement.acronyme}</p>
                              </div>
                              <div className="text-xs text-muted-foreground">→</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">Aucun département dans cette église</div>
                  )}
                  <Button
                    className="w-full mt-4 bg-transparent"
                    variant="outline"
                    onClick={() => {
                      setMobileModalOpen(false)
                      window.location.href = `/departements?eglise=${selectedEglise.id}`
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un département
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEglise ? "Modifier l'église" : "Ajouter une église"}</DialogTitle>
              <DialogDescription>
                {editingEglise ? "Modifiez les informations de l'église" : "Ajoutez une nouvelle église"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom de l'église</Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        placeholder="Ex: Église Évangélique"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ville">Ville</Label>
                      <Select
                        value={formData.villeId.toString()}
                        onValueChange={(value) => setFormData({ ...formData, villeId: Number.parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une ville" />
                        </SelectTrigger>
                        <SelectContent>
                          {villes.map((v) => (
                            <SelectItem key={v.id} value={v.id.toString()}>
                              {v.nom} ({v.pays?.nom})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adresse">Adresse</Label>
                    <Textarea
                      id="adresse"
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      placeholder="Ex: 15 Rue de la Paix, 75001 Paris"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            latitude: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                          })
                        }
                        placeholder="Ex: 48.8566"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            longitude: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                          })
                        }
                        placeholder="Ex: 2.3522"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sélectionner sur la carte (optionnel)</Label>
                  <LeafletMap
                    eglises={[]}
                    onCoordinatesSelect={handleCoordinatesSelect}
                    height="300px"
                    showControls={false}
                    center={
                      formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : undefined
                    }
                    zoom={formData.latitude && formData.longitude ? 15 : 6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">{editingEglise ? "Modifier" : "Ajouter"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
