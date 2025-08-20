"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, MapPin, Building, Users, Briefcase, Target, Map, Globe } from "lucide-react"

const navigationItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/continents", label: "Continents", icon: Globe },
  { href: "/pays", label: "Pays", icon: MapPin },
  { href: "/villes", label: "Villes", icon: Building },
  { href: "/eglises", label: "Églises", icon: Users },
  { href: "/departements", label: "Départements", icon: Briefcase },
  { href: "/poles", label: "Pôles", icon: Target },
  { href: "/carte", label: "Carte", icon: Map },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <div className="flex items-center space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={cn("flex items-center space-x-2", isActive && "bg-primary text-primary-foreground")}
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
