"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { EntityBreadcrumb } from "@/components/entity-breadcrumb"
import { RelatedEntities } from "@/components/related-entities"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { Plus } from "lucide-react"
import type { Continent, Pays, Ville, Eglise, CreatePaysData } from "@/lib/types"
import { ConfirmDialog } from "@/components/confirm-dialog"

export default function PaysPage() {
  const [continents, setContinents] = useState<Continent[]>([])
  const [pays, setPays] = useState<Pays[]>([])
  const [villes, setVilles] = useState<Ville[]>([])
  const [eglises, setEglises] = useState<Eglise[]>([])
  const [selectedPays, setSelectedPays] = useState<Pays | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mobileModalOpen, setMobileModalOpen] = useState(false)
  const [editingPays, setEditingPays] = useState<Pays | null>(null)
  const [formData, setFormData] = useState<CreatePaysData>({ nom: "", continentId: 0 })
  const { toast } = useToast()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [paysToDelete, setPaysToDelete] = useState<Pays | null>(null)
  const isMobile = useMobile()

  const fetchData = async () => {
    try {
      const [continentsResponse, paysResponse, villesResponse, eglisesResponse] = await Promise.all([
        fetch("/api/continents"),
        fetch("/api/pays"),
        fetch("/api/villes"),
        fetch("/api/eglises"),
      ])

      const [continentsResult, paysResult, villesResult, eglisesResult] = await Promise.all([
        continentsResponse.json(),
        paysResponse.json(),
        villesResponse.json(),
        eglisesResponse.json(),
      ])

      if (continentsResult.success) setContinents(continentsResult.data)
      if (paysResult.success) setPays(paysResult.data)
      if (villesResult.success) setVilles(villesResult.data)
      if (eglisesResult.success) setEglises(eglisesResult.data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les pays",
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

    if (!formData.continentId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un continent",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingPays ? `/api/pays/${editingPays.id}` : "/api/pays"
      const method = editingPays ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Succès",
          description: editingPays ? "Pays modifié avec succès" : "Pays créé avec succès",
        })
        setDialogOpen(false)
        setEditingPays(null)
        setFormData({ nom: "", continentId: 0 })
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

  const handleEdit = (pays: Pays) => {
    setEditingPays(pays)
    setFormData({ nom: pays.nom, continentId: pays.continentId })
    setDialogOpen(true)
  }

  const handleDelete = async (pays: Pays) => {
    setPaysToDelete(pays)
    setConfirmDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!paysToDelete) return

    try {
      const response = await fetch(`/api/pays/${paysToDelete.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Succès",
          description: "Pays supprimé avec succès",
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
    } finally {
      setConfirmDeleteOpen(false)
      setPaysToDelete(null)
    }
  }

  const handleRowClick = (pays: Pays) => {
    setSelectedPays(pays)
    if (isMobile) {
      setMobileModalOpen(true)
    }
  }

  const columns = [
    { key: "id", label: "ID" },
    { key: "nom", label: "Nom" },
    {
      key: "continent",
      label: "Continent",
      render: (value: any, item: Pays) => {
        const continent = continents.find((c) => c.id === item.continentId)
        return <span className="text-muted-foreground">{continent?.nom || "N/A"}</span>
      },
    },
    {
      key: "villes_count",
      label: "Villes",
      render: (value: any, item: Pays) => {
        const count = villes.filter((v) => v.paysId === item.id).length
        return <span className="font-medium">{count}</span>
      },
    },
    {
      key: "eglises_count",
      label: "Églises",
      render: (value: any, item: Pays) => {
        const villesInPays = villes.filter((v) => v.paysId === item.id)
        const eglisesCount = eglises.filter((e) => villesInPays.some((v) => v.id === e.villeId)).length
        return <span className="font-medium">{eglisesCount}</span>
      },
    },
  ]

  const villesForSelectedPays = selectedPays
    ? villes
        .filter((v) => v.paysId === selectedPays.id)
        .map((v) => ({
          id: v.id,
          name: v.nom,
          type: "ville" as const,
          href: `/villes?filter=${v.id}`,
        }))
    : []

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
        <EntityBreadcrumb items={[{ label: "Pays", current: true }]} className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestion des Pays</CardTitle>
                    <CardDescription>Gérez les pays de votre organisation</CardDescription>
                  </div>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un pays
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={pays}
                  columns={columns}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRowClick={handleRowClick}
                  searchPlaceholder="Rechercher un pays..."
                  emptyMessage="Aucun pays trouvé"
                />
              </CardContent>
            </Card>
          </div>

          <div className={isMobile ? "hidden" : ""}>
            {selectedPays ? (
              <RelatedEntities
                title={`Villes en ${selectedPays.nom}`}
                entities={villesForSelectedPays}
                emptyMessage="Aucune ville dans ce pays"
                showAddButton
                addButtonText="Ajouter une ville"
                addButtonHref={`/villes?pays=${selectedPays.id}`}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Détails du Pays</CardTitle>
                  <CardDescription>Cliquez sur un pays dans le tableau pour voir ses villes</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPays ? "Modifier le pays" : "Ajouter un pays"}</DialogTitle>
              <DialogDescription>
                {editingPays ? "Modifiez les informations du pays" : "Ajoutez un nouveau pays à votre organisation"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="continent">Continent</Label>
                  <Select
                    value={formData.continentId.toString()}
                    onValueChange={(value) => setFormData({ ...formData, continentId: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un continent" />
                    </SelectTrigger>
                    <SelectContent>
                      {continents.map((continent) => (
                        <SelectItem key={continent.id} value={continent.id.toString()}>
                          {continent.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom du pays</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: France"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">{editingPays ? "Modifier" : "Ajouter"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={mobileModalOpen} onOpenChange={setMobileModalOpen}>
          <DialogContent className="w-[95vw] max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails du Pays</DialogTitle>
            </DialogHeader>
            {selectedPays && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Nom:</span>
                    <span>{selectedPays.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Continent:</span>
                    <span>{continents.find((c) => c.id === selectedPays.continentId)?.nom || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Nombre de villes:</span>
                    <span className="text-blue-600 font-medium">{villesForSelectedPays.length}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Villes en {selectedPays.nom}</h4>
                  {villesForSelectedPays.length > 0 ? (
                    <div className="space-y-2">
                      {villesForSelectedPays.map((ville) => (
                        <div
                          key={ville.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => {
                            setMobileModalOpen(false)
                            window.location.href = `/villes?highlight=${ville.id}`
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="font-medium">{ville.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">→</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">Aucune ville dans ce pays</div>
                  )}
                  <Button
                    className="w-full mt-4 bg-transparent"
                    variant="outline"
                    onClick={() => {
                      setMobileModalOpen(false)
                      window.location.href = `/villes?pays=${selectedPays.id}`
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une ville
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          title="Supprimer le pays"
          description={`Êtes-vous sûr de vouloir supprimer le pays ${paysToDelete?.nom}?`}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  )
}
