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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { Plus, Target, Filter, Building2 } from "lucide-react"
import type { Departement, Eglise, Ville, Pays, CreateDepartementData, Pole } from "@/lib/types"
import Link from "next/link"

export default function DepartementsPage() {
  const [departements, setDepartements] = useState<Departement[]>([])
  const [eglises, setEglises] = useState<Eglise[]>([])
  const [villes, setVilles] = useState<Ville[]>([])
  const [pays, setPays] = useState<Pays[]>([])
  const [poles, setPoles] = useState<Pole[]>([])
  const [selectedDepartement, setSelectedDepartement] = useState<Departement | null>(null)
  const [filterEglise, setFilterEglise] = useState<string>("all")
  const [filterVille, setFilterVille] = useState<string>("all")
  const [filterPays, setFilterPays] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false)
  const [editingDepartement, setEditingDepartement] = useState<Departement | null>(null)
  const [formData, setFormData] = useState<CreateDepartementData>({ nom: "", acronyme: "", egliseId: 0 })
  const { toast } = useToast()
  const isMobile = useMobile()

  const fetchData = async () => {
    try {
      const [departementsResponse, eglisesResponse, villesResponse, paysResponse, polesResponse] = await Promise.all([
        fetch("/api/departements"),
        fetch("/api/eglises"),
        fetch("/api/villes"),
        fetch("/api/pays"),
        fetch("/api/poles"),
      ])

      const [departementsResult, eglisesResult, villesResult, paysResult, polesResult] = await Promise.all([
        departementsResponse.json(),
        eglisesResponse.json(),
        villesResponse.json(),
        paysResponse.json(),
        polesResponse.json(),
      ])

      if (departementsResult.success) setDepartements(departementsResult.data)
      if (eglisesResult.success) setEglises(eglisesResult.data)
      if (villesResult.success) setVilles(villesResult.data)
      if (paysResult.success) setPays(paysResult.data)
      if (polesResult.success) setPoles(polesResult.data)
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
      const url = editingDepartement ? `/api/departements/${editingDepartement.id}` : "/api/departements"
      const method = editingDepartement ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Succès",
          description: editingDepartement ? "Département modifié avec succès" : "Département créé avec succès",
        })
        setDialogOpen(false)
        setEditingDepartement(null)
        setFormData({ nom: "", acronyme: "", egliseId: 0 })
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

  const handleEdit = (departement: Departement) => {
    setEditingDepartement(departement)
    setFormData({ nom: departement.nom, acronyme: departement.acronyme, egliseId: departement.egliseId })
    setDialogOpen(true)
  }

  const handleDelete = async (departement: Departement) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce département ?")) return

    try {
      const response = await fetch(`/api/departements/${departement.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Succès",
          description: "Département supprimé avec succès",
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

  const handleRowClick = (departement: Departement) => {
    setSelectedDepartement(departement)
    if (isMobile) {
      setMobileDetailsOpen(true)
    }
  }

  const columns = [
    { key: "id", label: "ID" },
    { key: "nom", label: "Nom" },
    {
      key: "acronyme",
      label: "Acronyme",
      render: (value: string) => <Badge variant="secondary">{value}</Badge>,
    },
    { key: "eglise.nom", label: "Église" },
    {
      key: "pole",
      label: "Pôles",
      render: (value: any, item: any) => {
        const polesCount = poles.filter((pole) => pole.departementId === item.id).length
        return (
          <div className="flex items-center space-x-1">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-blue-600 font-medium">
              {polesCount} pôle{polesCount !== 1 ? "s" : ""}
            </span>
          </div>
        )
      },
    },
  ]

  const filteredDepartements = departements.filter((dept) => {
    if (filterEglise !== "all" && dept.egliseId.toString() !== filterEglise) return false
    if (filterVille !== "all" && dept.eglise?.villeId?.toString() !== filterVille) return false
    if (filterPays !== "all" && dept.eglise?.ville?.paysId?.toString() !== filterPays) return false
    return true
  })

  const clearFilters = () => {
    setFilterEglise("all")
    setFilterVille("all")
    setFilterPays("all")
  }

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
        <div className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"}`}>
          <div className={isMobile ? "" : "lg:col-span-2"}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestion des Départements</CardTitle>
                    <CardDescription>Cliquez sur une ligne pour voir les détails</CardDescription>
                  </div>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un département
                  </Button>
                </div>
                <div className="flex flex-wrap gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filtres:</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="min-w-[200px]">
                      <Select value={filterPays} onValueChange={setFilterPays}>
                        <SelectTrigger className="h-8">
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
                    <div className="min-w-[200px]">
                      <Select value={filterVille} onValueChange={setFilterVille}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Toutes les villes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les villes</SelectItem>
                          {villes
                            .filter((v) => filterPays === "all" || v.paysId.toString() === filterPays)
                            .map((v) => (
                              <SelectItem key={v.id} value={v.id.toString()}>
                                {v.nom}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="min-w-[200px]">
                      <Select value={filterEglise} onValueChange={setFilterEglise}>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes les églises" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les églises</SelectItem>
                          {eglises
                            .filter((e) => {
                              if (filterVille !== "all" && e.villeId?.toString() !== filterVille) return false
                              if (filterPays !== "all" && e.ville?.paysId?.toString() !== filterPays) return false
                              return true
                            })
                            .map((e) => (
                              <SelectItem key={e.id} value={e.id.toString()}>
                                {e.nom} - {e.ville?.nom}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {(filterEglise !== "all" || filterVille !== "all" || filterPays !== "all") && (
                      <Button variant="outline" size="sm" onClick={clearFilters} className="h-8 bg-transparent">
                        Effacer les filtres
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={filteredDepartements}
                  columns={columns}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRowClick={handleRowClick}
                  searchPlaceholder="Rechercher un département..."
                  emptyMessage="Aucun département trouvé"
                />
              </CardContent>
            </Card>
          </div>

          {!isMobile && (
            <div className="space-y-4">
              {selectedDepartement ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5" />
                      <span>Détails du département</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedDepartement.nom}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">{selectedDepartement.acronyme}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Église: {selectedDepartement.eglise?.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        Ville: {selectedDepartement.eglise?.ville?.nom} ({selectedDepartement.eglise?.ville?.pays?.nom})
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          Pôles ({poles.filter((p) => p.departementId === selectedDepartement.id).length})
                        </h4>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/poles?departement=${selectedDepartement.id}`}>
                            <Plus className="h-3 w-3 mr-1" />
                            Ajouter
                          </Link>
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {poles
                          .filter((p) => p.departementId === selectedDepartement.id)
                          .map((pole) => (
                            <Link
                              key={pole.id}
                              href={`/poles?highlight=${pole.id}`}
                              className="block p-2 rounded border hover:bg-muted transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{pole.nom}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Département: {selectedDepartement.nom}
                                  </p>
                                </div>
                                <div className="text-xs text-muted-foreground">ID: {pole.id}</div>
                              </div>
                            </Link>
                          ))}
                        {poles.filter((p) => p.departementId === selectedDepartement.id).length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Aucun pôle dans ce département
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">Sélectionnez un département pour voir ses détails</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <Dialog open={mobileDetailsOpen} onOpenChange={setMobileDetailsOpen}>
          <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Détails du département</span>
              </DialogTitle>
            </DialogHeader>
            {selectedDepartement && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedDepartement.nom}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary">{selectedDepartement.acronyme}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Église: {selectedDepartement.eglise?.nom}</p>
                  <p className="text-sm text-muted-foreground">
                    Ville: {selectedDepartement.eglise?.ville?.nom} ({selectedDepartement.eglise?.ville?.pays?.nom})
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      Pôles ({poles.filter((p) => p.departementId === selectedDepartement.id).length})
                    </h4>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/poles?departement=${selectedDepartement.id}`}>
                        <Plus className="h-3 w-3 mr-1" />
                        Ajouter
                      </Link>
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {poles
                      .filter((p) => p.departementId === selectedDepartement.id)
                      .map((pole) => (
                        <Link
                          key={pole.id}
                          href={`/poles?highlight=${pole.id}`}
                          className="block p-2 rounded border hover:bg-muted transition-colors"
                          onClick={() => setMobileDetailsOpen(false)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{pole.nom}</p>
                              <p className="text-xs text-muted-foreground">Département: {selectedDepartement.nom}</p>
                            </div>
                            <div className="text-xs text-muted-foreground">ID: {pole.id}</div>
                          </div>
                        </Link>
                      ))}
                    {poles.filter((p) => p.departementId === selectedDepartement.id).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Aucun pôle dans ce département</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDepartement ? "Modifier le département" : "Ajouter un département"}</DialogTitle>
              <DialogDescription>
                {editingDepartement
                  ? "Modifiez les informations du département"
                  : "Ajoutez un nouveau département à une église"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom du département</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: Ministère de la Jeunesse"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acronyme">Acronyme</Label>
                  <Input
                    id="acronyme"
                    value={formData.acronyme}
                    onChange={(e) => setFormData({ ...formData, acronyme: e.target.value.toUpperCase() })}
                    placeholder="Ex: MJ"
                    maxLength={10}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eglise">Église</Label>
                  <Select
                    value={formData.egliseId.toString()}
                    onValueChange={(value) => setFormData({ ...formData, egliseId: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une église" />
                    </SelectTrigger>
                    <SelectContent>
                      {eglises.map((e) => (
                        <SelectItem key={e.id} value={e.id.toString()}>
                          {e.nom} - {e.ville?.nom}
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
                <Button type="submit">{editingDepartement ? "Modifier" : "Ajouter"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
