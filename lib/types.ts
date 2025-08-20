// Types pour l'application de gestion d'églises

export interface Continent {
  id: number
  nom: string
  created_at?: string
  updated_at?: string
}

export interface Pays {
  id: number
  nom: string
  continentId: number
  continent?: Continent
  created_at?: string
  updated_at?: string
}

export interface Ville {
  id: number
  nom: string
  paysId: number
  pays?: Pays
  created_at?: string
  updated_at?: string
}

export interface Eglise {
  id: number
  nom: string
  adresse: string
  villeId: number
  latitude?: number
  longitude?: number
  ville?: Ville
  created_at?: string
  updated_at?: string
}

export interface Departement {
  id: number
  nom: string
  acronyme: string
  egliseId: number
  eglise?: Eglise
  pole?: Pole
  created_at?: string
  updated_at?: string
}

export interface Pole {
  id: number
  nom: string
  departementId: number
  departement?: Departement
  created_at?: string
  updated_at?: string
}

// Types pour les formulaires
export interface CreateContinentData {
  nom: string
}

export interface CreatePaysData {
  nom: string
  continentId: number
}

export interface CreateVilleData {
  nom: string
  paysId: number
}

export interface CreateEgliseData {
  nom: string
  adresse: string
  villeId: number
  latitude?: number
  longitude?: number
}

export interface CreateDepartementData {
  nom: string
  acronyme: string
  egliseId: number
}

export interface CreatePoleData {
  nom: string
  departementId: number
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
}
