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
import { Plus, AlertCircle } from "lucide-react"
import type { Pole, Departement, CreatePoleData } from "@/lib/types"

export default function PolesPage() {
  const [poles, setPoles] = useState<Pole[]>([])
  const [departements, setDepartements] = useState<Departement[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPole, setEditingPole] = useState<Pole | null>(null)
  const [formData, setFormData] = useState<CreatePoleData>({ nom: "", departementId: 0 })
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      const [polesResponse, departementsResponse] = await Promise.all([fetch("/api/poles"), fetch("/api/departements")])

      const [polesResult, departementsResult] = await Promise.all([polesResponse.json(), departementsResponse.json()])

      if (polesResult.success) setPoles(polesResult.data)
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
      const url = editingPole ? `/api/poles/${editingPole.id}` : "/api/poles"
      const method = editingPole ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Succès",
          description: editingPole ? "Pôle modifié avec succès" : "Pôle créé avec succès",
        })
        setDialogOpen(false)
        setEditingPole(null)
        setFormData({ nom: "", departementId: 0 })
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

  const handleEdit = (pole: Pole) => {
    setEditingPole(pole)
    setFormData({ nom: pole.nom, departementId: pole.departementId })
    setDialogOpen(true)
  }

  const handleDelete = async (pole: Pole) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce pôle ?")) return

    try {
      const response = await fetch(`/api/poles/${pole.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Succès",
          description: "Pôle supprimé avec succès",
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

  // Départements qui n'ont pas encore de pôle
  const availableDepartements = departements.filter(
    (dept) => !poles.some((pole) => pole.departementId === dept.id) || editingPole?.departementId === dept.id,
  )

  const columns = [
    { key: "id", label: "ID" },
    { key: "nom", label: "Nom du Pôle" },
    {
      key: "departement.nom",
      label: "Département",
      render: (value: string, item: Pole) => (
        <div className="space-y-1">
          <div className="font-medium">{value}</div>
          {item.departement?.acronyme && <Badge variant="outline">{item.departement.acronyme}</Badge>}
        </div>
      ),
    },
    {
      key: "departement.eglise.nom",
      label: "Église",
      render: (value: string) => <span className="text-sm text-muted-foreground">{value}</span>,
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestion des Pôles</CardTitle>
                <CardDescription>Gérez les pôles par département (optionnel)</CardDescription>
              </div>
              <Button onClick={() => setDialogOpen(true)} disabled={availableDepartements.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un pôle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {availableDepartements.length === 0 && !editingPole && (
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Tous les départements ont déjà un pôle assigné. Un département ne peut avoir qu'un seul pôle.
                  </span>
                </div>
              </div>
            )}

            <DataTable
              data={poles}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Rechercher un pôle..."
              emptyMessage="Aucun pôle trouvé"
            />
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPole ? "Modifier le pôle" : "Ajouter un pôle"}</DialogTitle>
              <DialogDescription>
                {editingPole
                  ? "Modifiez les informations du pôle"
                  : "Ajoutez un nouveau pôle à un département (un département ne peut avoir qu'un seul pôle)"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom du pôle</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: Pôle Adolescents"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departement">Département</Label>
                  <Select
                    value={formData.departementId.toString()}
                    onValueChange={(value) => setFormData({ ...formData, departementId: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un département" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDepartements.map((d) => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          <div className="flex items-center space-x-2">
                            <span>{d.nom}</span>
                            <Badge variant="outline">{d.acronyme}</Badge>
                            <span className="text-xs text-muted-foreground">({d.eglise?.nom})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableDepartements.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Aucun département disponible. Tous les départements ont déjà un pôle assigné.
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={availableDepartements.length === 0}>
                  {editingPole ? "Modifier" : "Ajouter"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
