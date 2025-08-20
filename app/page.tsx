"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Building, Users, Briefcase, Target, Map, AlertCircle, Plus, Globe } from "lucide-react"
import type { Eglise } from "@/lib/types"

interface Stats {
  continents: number
  pays: number
  villes: number
  eglises: number
  eglisesAvecCoordonnees: number
  departements: number
  poles: number
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    continents: 0,
    pays: 0,
    villes: 0,
    eglises: 0,
    eglisesAvecCoordonnees: 0,
    departements: 0,
    poles: 0,
  })
  const [recentEglises, setRecentEglises] = useState<Eglise[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const [continentsRes, paysRes, villesRes, eglisesRes, departementsRes, polesRes] = await Promise.all([
        fetch("/api/continents"),
        fetch("/api/pays"),
        fetch("/api/villes"),
        fetch("/api/eglises"),
        fetch("/api/departements"),
        fetch("/api/poles"),
      ])

      const [continentsData, paysData, villesData, eglisesData, departementsData, polesData] = await Promise.all([
        continentsRes.json(),
        paysRes.json(),
        villesRes.json(),
        eglisesRes.json(),
        departementsRes.json(),
        polesRes.json(),
      ])

      const eglisesAvecCoordonnees = eglisesData.success
        ? eglisesData.data.filter((e: Eglise) => e.latitude && e.longitude).length
        : 0

      setStats({
        continents: continentsData.success ? continentsData.data.length : 0,
        pays: paysData.success ? paysData.data.length : 0,
        villes: villesData.success ? villesData.data.length : 0,
        eglises: eglisesData.success ? eglisesData.data.length : 0,
        eglisesAvecCoordonnees,
        departements: departementsData.success ? departementsData.data.length : 0,
        poles: polesData.success ? polesData.data.length : 0,
      })

      if (eglisesData.success) {
        setRecentEglises(eglisesData.data.slice(-3).reverse())
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const managementSections = [
    {
      title: "Continents",
      description: "Gérer les continents de votre organisation",
      icon: Globe,
      href: "/continents",
      color: "text-indigo-600",
      count: stats.continents,
    },
    {
      title: "Pays",
      description: "Gérer les pays de votre organisation",
      icon: MapPin,
      href: "/pays",
      color: "text-blue-600",
      count: stats.pays,
    },
    {
      title: "Villes",
      description: "Gérer les villes par pays",
      icon: Building,
      href: "/villes",
      color: "text-green-600",
      count: stats.villes,
    },
    {
      title: "Églises",
      description: "Gérer les églises et leur localisation",
      icon: Users,
      href: "/eglises",
      color: "text-purple-600",
      count: stats.eglises,
    },
    {
      title: "Départements",
      description: "Gérer les départements par église",
      icon: Briefcase,
      href: "/departements",
      color: "text-orange-600",
      count: stats.departements,
    },
    {
      title: "Pôles",
      description: "Gérer les pôles par département",
      icon: Target,
      href: "/poles",
      color: "text-red-600",
      count: stats.poles,
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Système de Gestion d'Églises</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Gérez efficacement l'organisation hiérarchie au sein des églises ICC: continents, pays, villes, églises,
            départements et pôles.
          </p>
        </div>

        <div className="mb-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Hiérarchie Organisationnelle</CardTitle>
              <CardDescription>Structure complète de votre organisation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <Link href="/continents">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-950 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900 cursor-pointer transition-colors">
                      <Globe className="h-4 w-4 text-indigo-600" />
                      <span className="font-medium">{stats.continents} Continents</span>
                    </div>
                  </Link>
                  <span className="text-muted-foreground">→</span>
                  <Link href="/pays">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer transition-colors">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{stats.pays} Pays</span>
                    </div>
                  </Link>
                  <span className="text-muted-foreground">→</span>
                  <Link href="/villes">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-950 rounded-md hover:bg-green-100 dark:hover:bg-green-900 cursor-pointer transition-colors">
                      <Building className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{stats.villes} Villes</span>
                    </div>
                  </Link>
                  <span className="text-muted-foreground">→</span>
                  <Link href="/eglises">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-purple-50 dark:bg-purple-950 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer transition-colors">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">{stats.eglises} Églises</span>
                    </div>
                  </Link>
                </div>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <Link href="/eglises">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-purple-50 dark:bg-purple-950 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer transition-colors">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Églises</span>
                    </div>
                  </Link>
                  <span className="text-muted-foreground">→</span>
                  <Link href="/departements">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 dark:bg-orange-950 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900 cursor-pointer transition-colors">
                      <Briefcase className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">{stats.departements} Départements</span>
                    </div>
                  </Link>
                  <span className="text-muted-foreground">→</span>
                  <Link href="/poles">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 dark:bg-red-950 rounded-md hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer transition-colors">
                      <Target className="h-4 w-4 text-red-600" />
                      <span className="font-medium">{stats.poles} Pôles</span>
                      <span className="text-xs text-muted-foreground">(optionnel)</span>
                    </div>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Gestion</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {managementSections.map((section) => {
                const Icon = section.icon
                return (
                  <Card key={section.href} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-8 w-8 ${section.color}`} />
                          <div>
                            <CardTitle className="text-lg">{section.title}</CardTitle>
                            <CardDescription className="text-sm">{section.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary">{section.count}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button asChild className="w-full">
                        <Link href={section.href}>Gérer {section.title}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
                <CardDescription>Accès rapide aux fonctionnalités principales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/carte">
                    <Map className="mr-2 h-4 w-4" />
                    Voir la carte
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/eglises">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une église
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/departements">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Gérer les départements
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {recentEglises.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Églises Récentes</CardTitle>
                  <CardDescription>Dernières églises ajoutées</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentEglises.map((eglise) => (
                    <Link key={eglise.id} href={`/eglises/${eglise.id}`}>
                      <div className="flex items-center space-x-3 p-2 rounded-md border hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex-shrink-0">
                          {eglise.latitude && eglise.longitude ? (
                            <MapPin className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{eglise.nom}</p>
                          <p className="text-xs text-muted-foreground truncate">{eglise.ville?.nom}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/eglises">Voir toutes les églises</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {stats.eglises > 0 && stats.eglisesAvecCoordonnees < stats.eglises && (
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-orange-800 dark:text-orange-200">
                    <AlertCircle className="h-4 w-4" />
                    <span>Attention</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                    {stats.eglises - stats.eglisesAvecCoordonnees} église
                    {stats.eglises - stats.eglisesAvecCoordonnees !== 1 ? "s" : ""} n'ont pas de coordonnées GPS et
                    n'apparaissent pas sur la carte.
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/eglises">Ajouter les coordonnées</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
