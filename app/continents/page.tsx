"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { EntityBreadcrumb } from "@/components/entity-breadcrumb"
import { DataTable } from "@/components/data-table"
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
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { Plus } from "lucide-react"
import type { Continent, Pays, CreateContinentData } from "@/lib/types"

export default function ContinentsPage() {
  const [continents, setContinents] = useState<Continent[]>([])
  const [pays, setPays] = useState<Pays[]>([])
  const [selectedContinent, setSelectedContinent] = useState<Continent | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mobileModalOpen, setMobileModalOpen] = useState(false)
  const [editingContinent, setEditingContinent] = useState<Continent | null>(null)
  const [formData, setFormData] = useState<CreateContinentData>({ nom: "" })
  const { toast } = useToast()
  const isMobile = useMobile()

  const fetchData = async () => {
    try {
      const [continentsResponse, paysResponse] = await Promise.all([fetch("/api/continents"), fetch("/api/pays")])

      const [continentsResult, paysResult] = await Promise.all([continentsResponse.json(), paysResponse.json()])

      if (continentsResult.success) setContinents(continentsResult.data)
      if (paysResult.success) setPays(paysResult.data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les continents",
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
      const url = editingContinent ? `/api/continents/${editingContinent.id}` : "/api/continents"
      const method = editingContinent ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Succès",
          description: editingContinent ? "Continent modifié avec succès" : "Continent créé avec succès",
        })
        setDialogOpen(false)
        setMobileModalOpen(false)
        setEditingContinent(null)
        setFormData({ nom: "" })
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

  const handleEdit = (continent: Continent) => {
    setEditingContinent(continent)
    setFormData({ nom: continent.nom })
    setDialogOpen(true)
  }

  const handleDelete = async (continent: Continent) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce continent ?")) return

    try {
      const response = await fetch(`/api/continents/${continent.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Succès",
          description: "Continent supprimé avec succès",
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

  const handleRowClick = (continent: Continent) => {
    setSelectedContinent(continent)
    if (isMobile) {
      setMobileModalOpen(true)
    }
  }

  const columns = [
    { key: "id", label: "ID" },
    { key: "nom", label: "Nom" },
    {
      key: "pays_count",
      label: "Pays",
      render: (value: any, item: Continent) => {
        const count = pays.filter((p) => p.continentId === item.id).length
        return <span className="font-medium text-blue-600">{count}</span>
      },
    },
  ]

  const paysForSelectedContinent = pays
    .filter((p) => p.continentId === selectedContinent?.id)
    .map((p) => ({
      id: p.id,
      name: p.nom,
      type: "pays" as const,
      href: `/pays?filter=${p.id}`,
    }))

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
        <EntityBreadcrumb items={[{ label: "Continents", current: true }]} className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestion des Continents</CardTitle>
                    <CardDescription>Gérez les continents de votre organisation</CardDescription>
                  </div>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un continent
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={continents}
                  columns={columns}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRowClick={handleRowClick}
                  searchPlaceholder="Rechercher un continent..."
                  emptyMessage="Aucun continent trouvé"
                />
              </CardContent>
            </Card>
          </div>

          <div className={isMobile ? "hidden" : ""}>
            {selectedContinent ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Détails du Continent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Nom:</span>
                        <span>{selectedContinent.nom}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Nombre de pays:</span>
                        <span className="text-blue-600 font-medium">
                          {pays.filter((p) => p.continentId === selectedContinent.id).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pays en {selectedContinent.nom}</CardTitle>
                    <CardDescription>Cliquez sur un pays pour le gérer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {paysForSelectedContinent.length > 0 ? (
                      <div className="space-y-2">
                        {paysForSelectedContinent.map((country) => (
                          <div
                            key={country.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => (window.location.href = `/pays?highlight=${country.id}`)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="font-medium">{country.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Cliquez pour gérer →</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">Aucun pays dans ce continent</div>
                    )}
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        className="w-full bg-transparent"
                        variant="outline"
                        onClick={() => (window.location.href = `/pays?continent=${selectedContinent.id}`)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un pays à {selectedContinent.nom}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Détails du Continent</CardTitle>
                  <CardDescription>
                    Cliquez sur un continent dans le tableau pour voir ses détails et pays
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>

        <Dialog open={mobileModalOpen} onOpenChange={setMobileModalOpen}>
          <DialogContent className="w-[95vw] max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails du Continent</DialogTitle>
            </DialogHeader>
            {selectedContinent && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Nom:</span>
                    <span>{selectedContinent.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Nombre de pays:</span>
                    <span className="text-blue-600 font-medium">
                      {pays.filter((p) => p.continentId === selectedContinent.id).length}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Pays en {selectedContinent.nom}</h4>
                  {paysForSelectedContinent.length > 0 ? (
                    <div className="space-y-2">
                      {paysForSelectedContinent.map((country) => (
                        <div
                          key={country.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => {
                            setMobileModalOpen(false)
                            window.location.href = `/pays?highlight=${country.id}`
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="font-medium">{country.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">→</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">Aucun pays dans ce continent</div>
                  )}
                  <Button
                    className="w-full mt-4 bg-transparent"
                    variant="outline"
                    onClick={() => {
                      setMobileModalOpen(false)
                      window.location.href = `/pays?continent=${selectedContinent.id}`
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un pays
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingContinent ? "Modifier le continent" : "Ajouter un continent"}</DialogTitle>
              <DialogDescription>
                {editingContinent
                  ? "Modifiez les informations du continent"
                  : "Ajoutez un nouveau continent à votre organisation"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom du continent</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: Europe"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">{editingContinent ? "Modifier" : "Ajouter"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
