"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, Users, Briefcase, Target, ExternalLink } from "lucide-react"

interface RelatedEntity {
  id: number
  name: string
  type: "ville" | "eglise" | "departement" | "pole"
  count?: number
  href: string
}

interface RelatedEntitiesProps {
  title: string
  entities: RelatedEntity[]
  emptyMessage?: string
  showAddButton?: boolean
  addButtonText?: string
  addButtonHref?: string
}

export function RelatedEntities({
  title,
  entities,
  emptyMessage = "Aucun élément trouvé",
  showAddButton = false,
  addButtonText = "Ajouter",
  addButtonHref = "#",
}: RelatedEntitiesProps) {
  const getIcon = (type: RelatedEntity["type"]) => {
    switch (type) {
      case "ville":
        return Building
      case "eglise":
        return Users
      case "departement":
        return Briefcase
      case "pole":
        return Target
      default:
        return Building
    }
  }

  const getColor = (type: RelatedEntity["type"]) => {
    switch (type) {
      case "ville":
        return "text-green-600"
      case "eglise":
        return "text-purple-600"
      case "departement":
        return "text-orange-600"
      case "pole":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>
              {entities.length} élément{entities.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          {showAddButton && (
            <Button asChild size="sm">
              <Link href={addButtonHref}>{addButtonText}</Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {entities.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">{emptyMessage}</p>
        ) : (
          <div className="space-y-2">
            {entities.map((entity) => {
              const Icon = getIcon(entity.type)
              const color = getColor(entity.type)

              return (
                <div
                  key={entity.id}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <div>
                      <p className="font-medium">{entity.name}</p>
                      {entity.count !== undefined && (
                        <Badge variant="secondary" className="text-xs">
                          {entity.count} élément{entity.count !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={entity.href}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
