"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
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
import { Plus, MapPin, Building2 } from "lucide-react"
import Link from "next/link"
import type { Ville, Pays, Eglise, CreateVilleData } from "@/lib/types"

export default function VillesPage() {
  const [villes, setVilles] = useState<Ville[]>([])
  const [pays, setPays] = useState<Pays[]>([])
  const [eglises, setEglises] = useState<Eglise[]>([])
  const [selectedVille, setSelectedVille] = useState<Ville | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mobileModalOpen, setMobileModalOpen] = useState(false)
  const [editingVille, setEditingVille] = useState<Ville | null>(null)
  const [formData, setFormData] = useState<CreateVilleData>({ nom: "", paysId: 0 })
  const { toast } = useToast()
  const isMobile = useMobile()

  const fetchData = async () => {
    try {
      const [villesResponse, paysResponse, eglisesResponse] = await Promise.all([
        fetch("/api/villes"),
        fetch("/api/pays"),
        fetch("/api/eglises"),
      ])

      const [villesResult, paysResult, eglisesResult] = await Promise.all([
        villesResponse.json(),
        paysResponse.json(),
        eglisesResponse.json(),
      ])

      if (villesResult.success) setVilles(villesResult.data)
      if (paysResult.success) setPays(paysResult.data)
      if (eglisesResult.success) setEglises(eglisesResult.data)
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
      const url = editingVille ? `/api/villes/${editingVille.id}` : "/api/villes"
      const method = editingVille ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Succès",
          description: editingVille ? "Ville modifiée avec succès" : "Ville créée avec succès",
        })
        setDialogOpen(false)
        setMobileModalOpen(false)
        setEditingVille(null)
        setFormData({ nom: "", paysId: 0 })
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

  const handleEdit = (ville: Ville) => {
    setEditingVille(ville)
    setFormData({ nom: ville.nom, paysId: ville.paysId })
    setDialogOpen(true)
  }

  const handleDelete = async (ville: Ville) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette ville ?")) return

    try {
      const response = await fetch(`/api/villes/${ville.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Succès",
          description: "Ville supprimée avec succès",
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

  const handleRowClick = (ville: Ville) => {
    setSelectedVille(ville)
    if (isMobile) {
      setMobileModalOpen(true)
    }
  }

  const getEglisesCount = (villeId: number) => {
    return eglises.filter((eglise) => eglise.villeId === villeId).length
  }

  const getEglisesForVille = (villeId: number) => {
    return eglises.filter((eglise) => eglise.villeId === villeId)
  }

  const columns = [
    { key: "id", label: "ID" },
    { key: "nom", label: "Nom" },
    { key: "pays.nom", label: "Pays" },
    {
      key: "eglises_count",
      label: "Églises",
      render: (_: any, item: Ville) => <span className="font-medium text-blue-600">{getEglisesCount(item.id)}</span>,
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestion des Villes</CardTitle>
                    <CardDescription>Gérez les villes par pays</CardDescription>
                  </div>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une ville
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={villes}
                  columns={columns}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRowClick={handleRowClick}
                  searchPlaceholder="Rechercher une ville..."
                  emptyMessage="Aucune ville trouvée"
                />
              </CardContent>
            </Card>
          </div>

          <div className={`space-y-6 ${isMobile ? "hidden" : ""}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Détails de la ville
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedVille ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedVille.nom}</h3>
                      <p className="text-muted-foreground">
                        Pays: {pays.find((p) => p.id === selectedVille.paysId)?.nom || "Non trouvé"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getEglisesCount(selectedVille.id)} église{getEglisesCount(selectedVille.id) !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Églises de cette ville
                      </h4>
                      <div className="space-y-2">
                        {getEglisesForVille(selectedVille.id).length > 0 ? (
                          getEglisesForVille(selectedVille.id).map((eglise) => (
                            <Link
                              key={eglise.id}
                              href={`/eglises?highlight=${eglise.id}`}
                              className="block p-3 border rounded-lg hover:bg-muted transition-colors"
                            >
                              <div className="font-medium">{eglise.nom}</div>
                              <div className="text-sm text-muted-foreground">{eglise.adresse}</div>
                            </Link>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-sm">Aucune église dans cette ville</p>
                        )}
                      </div>
                      <Button
                        className="w-full mt-3 bg-transparent"
                        variant="outline"
                        onClick={() => window.open(`/eglises?ville=${selectedVille.id}`, "_blank")}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter une église
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sélectionnez une ville pour voir ses détails</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVille ? "Modifier la ville" : "Ajouter une ville"}</DialogTitle>
              <DialogDescription>
                {editingVille ? "Modifiez les informations de la ville" : "Ajoutez une nouvelle ville"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de la ville</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: Paris"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pays">Pays</Label>
                  <Select
                    value={formData.paysId.toString()}
                    onValueChange={(value) => setFormData({ ...formData, paysId: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {pays.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">{editingVille ? "Modifier" : "Ajouter"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={mobileModalOpen} onOpenChange={setMobileModalOpen}>
          <DialogContent className="w-[95vw] max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de la Ville</DialogTitle>
            </DialogHeader>
            {selectedVille && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Nom:</span>
                    <span>{selectedVille.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Pays:</span>
                    <span>{pays.find((p) => p.id === selectedVille.paysId)?.nom || "Non trouvé"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Nombre d'églises:</span>
                    <span className="text-blue-600 font-medium">{getEglisesCount(selectedVille.id)}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Églises de cette ville</h4>
                  {getEglisesForVille(selectedVille.id).length > 0 ? (
                    <div className="space-y-2">
                      {getEglisesForVille(selectedVille.id).map((eglise) => (
                        <div
                          key={eglise.id}
                          className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => {
                            setMobileModalOpen(false)
                            window.location.href = `/eglises?highlight=${eglise.id}`
                          }}
                        >
                          <div className="font-medium">{eglise.nom}</div>
                          <div className="text-sm text-muted-foreground">{eglise.adresse}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">Aucune église dans cette ville</div>
                  )}
                  <Button
                    className="w-full mt-4 bg-transparent"
                    variant="outline"
                    onClick={() => {
                      setMobileModalOpen(false)
                      window.location.href = `/eglises?ville=${selectedVille.id}`
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une église
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
