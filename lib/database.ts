// Utilitaires pour la base de données

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "DatabaseError"
  }
}

// Fonction utilitaire pour convertir les noms de colonnes snake_case en camelCase
export function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj

  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }

  if (typeof obj === "object") {
    const converted: any = {}
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      converted[camelKey] = toCamelCase(value)
    }
    return converted
  }

  return obj
}

// Fonction utilitaire pour convertir les noms de propriétés camelCase en snake_case
export function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj

  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase)
  }

  if (typeof obj === "object") {
    const converted: any = {}
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      converted[snakeKey] = toSnakeCase(value)
    }
    return converted
  }

  return obj
}

// Configuration de pagination par défaut
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100

export function validatePagination(page?: number, limit?: number) {
  const validPage = Math.max(1, page || 1)
  const validLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, limit || DEFAULT_PAGE_SIZE))

  return { page: validPage, limit: validLimit }
}
