// Service de base de données pour les opérations CRUD

import { DatabaseError, validatePagination } from "./database"
import type {
  Continent,
  Pays,
  Ville,
  Eglise,
  Departement,
  Pole,
  CreateContinentData,
  CreatePaysData,
  CreateVilleData,
  CreateEgliseData,
  CreateDepartementData,
  CreatePoleData,
  PaginatedResponse,
} from "./types"

// Simulation d'une connexion à la base de données
// En production, vous utiliseriez une vraie base de données comme PostgreSQL
class DatabaseService {
  private data = {
    continent: [] as Continent[],
    pays: [] as Pays[],
    ville: [] as Ville[],
    eglise: [] as Eglise[],
    departement: [] as Departement[],
    pole: [] as Pole[],
  }

  private nextId = {
    continent: 1,
    pays: 1,
    ville: 1,
    eglise: 1,
    departement: 1,
    pole: 1,
  }

  constructor() {
    this.initializeData()
  }

  private initializeData() {
    // Données d'exemple
    this.data.continent = [
      { id: 1, nom: "Afrique" },
      { id: 2, nom: "Asie" },
      { id: 3, nom: "Amérique" },
      { id: 4, nom: "Europe" },
      { id: 5, nom: "Océanie" },
    ]
    this.nextId.continent = 6

    this.data.pays = [
      { id: 1, nom: "France", continentId: 4 },
      { id: 2, nom: "Belgique", continentId: 4 },
      { id: 3, nom: "Suisse", continentId: 4 },
      { id: 4, nom: "Canada", continentId: 3 },
    ]
    this.nextId.pays = 5

    this.data.ville = [
      { id: 1, nom: "Paris", paysId: 1 },
      { id: 2, nom: "Lyon", paysId: 1 },
      { id: 3, nom: "Marseille", paysId: 1 },
      { id: 4, nom: "Bruxelles", paysId: 2 },
      { id: 5, nom: "Genève", paysId: 3 },
      { id: 6, nom: "Montréal", paysId: 4 },
    ]
    this.nextId.ville = 7

    this.data.eglise = [
      {
        id: 1,
        nom: "Église Évangélique de Paris Centre",
        adresse: "15 Rue de la Paix, 75001 Paris",
        villeId: 1,
        latitude: 48.8566,
        longitude: 2.3522,
      },
      {
        id: 2,
        nom: "Assemblée Chrétienne de Lyon",
        adresse: "25 Avenue de la République, 69002 Lyon",
        villeId: 2,
        latitude: 45.764,
        longitude: 4.8357,
      },
      {
        id: 3,
        nom: "Église Protestante de Marseille",
        adresse: "10 Boulevard Longchamp, 13001 Marseille",
        villeId: 3,
        latitude: 43.2965,
        longitude: 5.3698,
      },
    ]
    this.nextId.eglise = 4

    this.data.departement = [
      { id: 1, nom: "Ministère de la Jeunesse", acronyme: "MJ", egliseId: 1 },
      { id: 2, nom: "Ministère de la Louange", acronyme: "ML", egliseId: 1 },
      { id: 3, nom: "Ministère des Enfants", acronyme: "ME", egliseId: 1 },
      { id: 4, nom: "Ministère de l'Évangélisation", acronyme: "MEV", egliseId: 2 },
    ]
    this.nextId.departement = 5

    this.data.pole = [
      { id: 1, nom: "Pôle Adolescents", departementId: 1 },
      { id: 2, nom: "Pôle Jeunes Adultes", departementId: 1 },
      { id: 3, nom: "Pôle Chorale", departementId: 2 },
    ]
    this.nextId.pole = 4
  }

  // CRUD pour Continents
  async getAllContinents(page = 1, limit = 10): Promise<PaginatedResponse<Continent>> {
    const { page: validPage, limit: validLimit } = validatePagination(page, limit)
    const offset = (validPage - 1) * validLimit
    const total = this.data.continent.length
    const data = this.data.continent.slice(offset, offset + validLimit)

    return {
      success: true,
      data,
      total,
      page: validPage,
      limit: validLimit,
    }
  }

  async getContinentById(id: number): Promise<Continent | null> {
    return this.data.continent.find((c) => c.id === id) || null
  }

  async createContinent(data: CreateContinentData): Promise<Continent> {
    const newContinent: Continent = {
      id: this.nextId.continent++,
      nom: data.nom,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.data.continent.push(newContinent)
    return newContinent
  }

  async updateContinent(id: number, data: Partial<CreateContinentData>): Promise<Continent | null> {
    const index = this.data.continent.findIndex((c) => c.id === id)
    if (index === -1) return null

    this.data.continent[index] = {
      ...this.data.continent[index],
      ...data,
      updated_at: new Date().toISOString(),
    }
    return this.data.continent[index]
  }

  async deleteContinent(id: number): Promise<boolean> {
    const index = this.data.continent.findIndex((c) => c.id === id)
    if (index === -1) return false

    // Vérifier s'il y a des pays liés
    const hasPays = this.data.pays.some((p) => p.continentId === id)
    if (hasPays) {
      throw new DatabaseError("Cannot delete continent with associated countries")
    }

    this.data.continent.splice(index, 1)
    return true
  }

  // CRUD pour Pays
  async getAllPays(page = 1, limit = 10, continentId?: number): Promise<PaginatedResponse<Pays>> {
    const { page: validPage, limit: validLimit } = validatePagination(page, limit)
    let filteredData = this.data.pays

    if (continentId) {
      filteredData = this.data.pays.filter((p) => p.continentId === continentId)
    }

    const offset = (validPage - 1) * validLimit
    const total = filteredData.length
    const data = filteredData.slice(offset, offset + validLimit).map((pays) => ({
      ...pays,
      continent: this.data.continent.find((c) => c.id === pays.continentId),
    }))

    return {
      success: true,
      data,
      total,
      page: validPage,
      limit: validLimit,
    }
  }

  async getPaysById(id: number): Promise<Pays | null> {
    const pays = this.data.pays.find((p) => p.id === id)
    if (!pays) return null

    return {
      ...pays,
      continent: this.data.continent.find((c) => c.id === pays.continentId),
    }
  }

  async createPays(data: CreatePaysData): Promise<Pays> {
    const newPays: Pays = {
      id: this.nextId.pays++,
      nom: data.nom,
      continentId: data.continentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.data.pays.push(newPays)

    return {
      ...newPays,
      continent: this.data.continent.find((c) => c.id === newPays.continentId),
    }
  }

  async updatePays(id: number, data: Partial<CreatePaysData>): Promise<Pays | null> {
    const index = this.data.pays.findIndex((p) => p.id === id)
    if (index === -1) return null

    this.data.pays[index] = {
      ...this.data.pays[index],
      ...data,
      updated_at: new Date().toISOString(),
    }
    return {
      ...this.data.pays[index],
      continent: this.data.continent.find((c) => c.id === this.data.pays[index].continentId),
    }
  }

  async deletePays(id: number): Promise<boolean> {
    const index = this.data.pays.findIndex((p) => p.id === id)
    if (index === -1) return false

    // Vérifier s'il y a des villes liées
    const hasVilles = this.data.ville.some((v) => v.paysId === id)
    if (hasVilles) {
      throw new DatabaseError("Cannot delete country with associated cities")
    }

    this.data.pays.splice(index, 1)
    return true
  }

  // CRUD pour Villes
  async getAllVilles(page = 1, limit = 10, paysId?: number): Promise<PaginatedResponse<Ville>> {
    const { page: validPage, limit: validLimit } = validatePagination(page, limit)
    let filteredData = this.data.ville

    if (paysId) {
      filteredData = this.data.ville.filter((v) => v.paysId === paysId)
    }

    const offset = (validPage - 1) * validLimit
    const total = filteredData.length
    const data = filteredData.slice(offset, offset + validLimit).map((ville) => ({
      ...ville,
      pays: this.data.pays.find((p) => p.id === ville.paysId),
    }))

    return {
      success: true,
      data,
      total,
      page: validPage,
      limit: validLimit,
    }
  }

  async getVilleById(id: number): Promise<Ville | null> {
    const ville = this.data.ville.find((v) => v.id === id)
    if (!ville) return null

    return {
      ...ville,
      pays: this.data.pays.find((p) => p.id === ville.paysId),
    }
  }

  async createVille(data: CreateVilleData): Promise<Ville> {
    const newVille: Ville = {
      id: this.nextId.ville++,
      nom: data.nom,
      paysId: data.paysId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.data.ville.push(newVille)

    return {
      ...newVille,
      pays: this.data.pays.find((p) => p.id === newVille.paysId),
    }
  }

  async updateVille(id: number, data: Partial<CreateVilleData>): Promise<Ville | null> {
    const index = this.data.ville.findIndex((v) => v.id === id)
    if (index === -1) return null

    this.data.ville[index] = {
      ...this.data.ville[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    return {
      ...this.data.ville[index],
      pays: this.data.pays.find((p) => p.id === this.data.ville[index].paysId),
    }
  }

  async deleteVille(id: number): Promise<boolean> {
    const index = this.data.ville.findIndex((v) => v.id === id)
    if (index === -1) return false

    // Vérifier s'il y a des églises liées
    const hasEglises = this.data.eglise.some((e) => e.villeId === id)
    if (hasEglises) {
      throw new DatabaseError("Cannot delete city with associated churches")
    }

    this.data.ville.splice(index, 1)
    return true
  }

  // CRUD pour Églises
  async getAllEglises(page = 1, limit = 10, villeId?: number): Promise<PaginatedResponse<Eglise>> {
    const { page: validPage, limit: validLimit } = validatePagination(page, limit)
    let filteredData = this.data.eglise

    if (villeId) {
      filteredData = this.data.eglise.filter((e) => e.villeId === villeId)
    }

    const offset = (validPage - 1) * validLimit
    const total = filteredData.length
    const data = filteredData.slice(offset, offset + validLimit).map((eglise) => ({
      ...eglise,
      ville: this.data.ville.find((v) => v.id === eglise.villeId),
    }))

    return {
      success: true,
      data,
      total,
      page: validPage,
      limit: validLimit,
    }
  }

  async getEgliseById(id: number): Promise<Eglise | null> {
    const eglise = this.data.eglise.find((e) => e.id === id)
    if (!eglise) return null

    return {
      ...eglise,
      ville: this.data.ville.find((v) => v.id === eglise.villeId),
    }
  }

  async createEglise(data: CreateEgliseData): Promise<Eglise> {
    const newEglise: Eglise = {
      id: this.nextId.eglise++,
      nom: data.nom,
      adresse: data.adresse,
      villeId: data.villeId,
      latitude: data.latitude,
      longitude: data.longitude,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.data.eglise.push(newEglise)

    return {
      ...newEglise,
      ville: this.data.ville.find((v) => v.id === newEglise.villeId),
    }
  }

  async updateEglise(id: number, data: Partial<CreateEgliseData>): Promise<Eglise | null> {
    const index = this.data.eglise.findIndex((e) => e.id === id)
    if (index === -1) return null

    this.data.eglise[index] = {
      ...this.data.eglise[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    return {
      ...this.data.eglise[index],
      ville: this.data.ville.find((v) => v.id === this.data.eglise[index].villeId),
    }
  }

  async deleteEglise(id: number): Promise<boolean> {
    const index = this.data.eglise.findIndex((e) => e.id === id)
    if (index === -1) return false

    // Vérifier s'il y a des départements liés
    const hasDepartements = this.data.departement.some((d) => d.egliseId === id)
    if (hasDepartements) {
      throw new DatabaseError("Cannot delete church with associated departments")
    }

    this.data.eglise.splice(index, 1)
    return true
  }

  // CRUD pour Départements
  async getAllDepartements(page = 1, limit = 10, egliseId?: number): Promise<PaginatedResponse<Departement>> {
    const { page: validPage, limit: validLimit } = validatePagination(page, limit)
    let filteredData = this.data.departement

    if (egliseId) {
      filteredData = this.data.departement.filter((d) => d.egliseId === egliseId)
    }

    const offset = (validPage - 1) * validLimit
    const total = filteredData.length
    const data = filteredData.slice(offset, offset + validLimit).map((departement) => ({
      ...departement,
      eglise: this.data.eglise.find((e) => e.id === departement.egliseId),
      pole: this.data.pole.find((p) => p.departementId === departement.id),
    }))

    return {
      success: true,
      data,
      total,
      page: validPage,
      limit: validLimit,
    }
  }

  async getDepartementById(id: number): Promise<Departement | null> {
    const departement = this.data.departement.find((d) => d.id === id)
    if (!departement) return null

    return {
      ...departement,
      eglise: this.data.eglise.find((e) => e.id === departement.egliseId),
      pole: this.data.pole.find((p) => p.departementId === departement.id),
    }
  }

  async createDepartement(data: CreateDepartementData): Promise<Departement> {
    const newDepartement: Departement = {
      id: this.nextId.departement++,
      nom: data.nom,
      acronyme: data.acronyme,
      egliseId: data.egliseId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.data.departement.push(newDepartement)

    return {
      ...newDepartement,
      eglise: this.data.eglise.find((e) => e.id === newDepartement.egliseId),
    }
  }

  async updateDepartement(id: number, data: Partial<CreateDepartementData>): Promise<Departement | null> {
    const index = this.data.departement.findIndex((d) => d.id === id)
    if (index === -1) return null

    this.data.departement[index] = {
      ...this.data.departement[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    return {
      ...this.data.departement[index],
      eglise: this.data.eglise.find((e) => e.id === this.data.departement[index].egliseId),
      pole: this.data.pole.find((p) => p.departementId === this.data.departement[index].id),
    }
  }

  async deleteDepartement(id: number): Promise<boolean> {
    const index = this.data.departement.findIndex((d) => d.id === id)
    if (index === -1) return false

    // Supprimer le pôle associé s'il existe
    const poleIndex = this.data.pole.findIndex((p) => p.departementId === id)
    if (poleIndex !== -1) {
      this.data.pole.splice(poleIndex, 1)
    }

    this.data.departement.splice(index, 1)
    return true
  }

  // CRUD pour Pôles
  async getAllPoles(page = 1, limit = 10, departementId?: number): Promise<PaginatedResponse<Pole>> {
    const { page: validPage, limit: validLimit } = validatePagination(page, limit)
    let filteredData = this.data.pole

    if (departementId) {
      filteredData = this.data.pole.filter((p) => p.departementId === departementId)
    }

    const offset = (validPage - 1) * validLimit
    const total = filteredData.length
    const data = filteredData.slice(offset, offset + validLimit).map((pole) => ({
      ...pole,
      departement: this.data.departement.find((d) => d.id === pole.departementId),
    }))

    return {
      success: true,
      data,
      total,
      page: validPage,
      limit: validLimit,
    }
  }

  async getPoleById(id: number): Promise<Pole | null> {
    const pole = this.data.pole.find((p) => p.id === id)
    if (!pole) return null

    return {
      ...pole,
      departement: this.data.departement.find((d) => d.id === pole.departementId),
    }
  }

  async createPole(data: CreatePoleData): Promise<Pole> {
    // Vérifier qu'il n'y a pas déjà un pôle pour ce département
    const existingPole = this.data.pole.find((p) => p.departementId === data.departementId)
    if (existingPole) {
      throw new DatabaseError("Department already has a pole")
    }

    const newPole: Pole = {
      id: this.nextId.pole++,
      nom: data.nom,
      departementId: data.departementId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.data.pole.push(newPole)

    return {
      ...newPole,
      departement: this.data.departement.find((d) => d.id === newPole.departementId),
    }
  }

  async updatePole(id: number, data: Partial<CreatePoleData>): Promise<Pole | null> {
    const index = this.data.pole.findIndex((p) => p.id === id)
    if (index === -1) return null

    this.data.pole[index] = {
      ...this.data.pole[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    return {
      ...this.data.pole[index],
      departement: this.data.departement.find((d) => d.id === this.data.pole[index].departementId),
    }
  }

  async deletePole(id: number): Promise<boolean> {
    const index = this.data.pole.findIndex((p) => p.id === id)
    if (index === -1) return false

    this.data.pole.splice(index, 1)
    return true
  }
}

// Instance singleton du service de base de données
export const dbService = new DatabaseService()
