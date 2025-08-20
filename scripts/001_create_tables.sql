-- Script de création des tables pour l'application de gestion d'églises

-- Table des pays
CREATE TABLE IF NOT EXISTS pays (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des villes
CREATE TABLE IF NOT EXISTS ville (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    pays_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pays_id) REFERENCES pays(id) ON DELETE CASCADE,
    UNIQUE(nom, pays_id)
);

-- Table des églises
CREATE TABLE IF NOT EXISTS eglise (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    adresse TEXT NOT NULL,
    ville_id INTEGER NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ville_id) REFERENCES ville(id) ON DELETE CASCADE
);

-- Table des départements
CREATE TABLE IF NOT EXISTS departement (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    acronyme VARCHAR(10) NOT NULL,
    eglise_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eglise_id) REFERENCES eglise(id) ON DELETE CASCADE,
    UNIQUE(acronyme, eglise_id)
);

-- Table des pôles
CREATE TABLE IF NOT EXISTS pole (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    departement_id INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (departement_id) REFERENCES departement(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_ville_pays_id ON ville(pays_id);
CREATE INDEX IF NOT EXISTS idx_eglise_ville_id ON eglise(ville_id);
CREATE INDEX IF NOT EXISTS idx_eglise_coordinates ON eglise(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_departement_eglise_id ON departement(eglise_id);
CREATE INDEX IF NOT EXISTS idx_pole_departement_id ON pole(departement_id);
