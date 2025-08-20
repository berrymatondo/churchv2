-- Données d'exemple pour tester l'application

-- Insertion de pays d'exemple
INSERT INTO pays (nom) VALUES 
    ('France'),
    ('Belgique'),
    ('Suisse'),
    ('Canada')
ON CONFLICT (nom) DO NOTHING;

-- Insertion de villes d'exemple
INSERT INTO ville (nom, pays_id) VALUES 
    ('Paris', (SELECT id FROM pays WHERE nom = 'France')),
    ('Lyon', (SELECT id FROM pays WHERE nom = 'France')),
    ('Marseille', (SELECT id FROM pays WHERE nom = 'France')),
    ('Bruxelles', (SELECT id FROM pays WHERE nom = 'Belgique')),
    ('Genève', (SELECT id FROM pays WHERE nom = 'Suisse')),
    ('Montréal', (SELECT id FROM pays WHERE nom = 'Canada'))
ON CONFLICT (nom, pays_id) DO NOTHING;

-- Insertion d'églises d'exemple
INSERT INTO eglise (nom, adresse, ville_id, latitude, longitude) VALUES 
    ('Église Évangélique de Paris Centre', '15 Rue de la Paix, 75001 Paris', 
     (SELECT id FROM ville WHERE nom = 'Paris'), 48.8566, 2.3522),
    ('Assemblée Chrétienne de Lyon', '25 Avenue de la République, 69002 Lyon', 
     (SELECT id FROM ville WHERE nom = 'Lyon'), 45.7640, 4.8357),
    ('Église Protestante de Marseille', '10 Boulevard Longchamp, 13001 Marseille', 
     (SELECT id FROM ville WHERE nom = 'Marseille'), 43.2965, 5.3698),
    ('Église Évangélique de Bruxelles', '5 Avenue Louise, 1000 Bruxelles', 
     (SELECT id FROM ville WHERE nom = 'Bruxelles'), 50.8503, 4.3517),
    ('Assemblée de Genève', '12 Rue du Rhône, 1204 Genève', 
     (SELECT id FROM ville WHERE nom = 'Genève'), 46.2044, 6.1432),
    ('Église Évangélique de Montréal', '100 Rue Sainte-Catherine, Montréal', 
     (SELECT id FROM ville WHERE nom = 'Montréal'), 45.5017, -73.5673);

-- Insertion de départements d'exemple
INSERT INTO departement (nom, acronyme, eglise_id) VALUES 
    ('Ministère de la Jeunesse', 'MJ', (SELECT id FROM eglise WHERE nom = 'Église Évangélique de Paris Centre')),
    ('Ministère de la Louange', 'ML', (SELECT id FROM eglise WHERE nom = 'Église Évangélique de Paris Centre')),
    ('Ministère des Enfants', 'ME', (SELECT id FROM eglise WHERE nom = 'Église Évangélique de Paris Centre')),
    ('Ministère de l''Évangélisation', 'MEV', (SELECT id FROM eglise WHERE nom = 'Assemblée Chrétienne de Lyon')),
    ('Ministère de la Formation', 'MF', (SELECT id FROM eglise WHERE nom = 'Assemblée Chrétienne de Lyon')),
    ('Ministère Social', 'MS', (SELECT id FROM eglise WHERE nom = 'Église Protestante de Marseille'));

-- Insertion de pôles d'exemple (certains départements ont des pôles, d'autres non)
INSERT INTO pole (nom, departement_id) VALUES 
    ('Pôle Adolescents', (SELECT id FROM departement WHERE acronyme = 'MJ' AND eglise_id = (SELECT id FROM eglise WHERE nom = 'Église Évangélique de Paris Centre'))),
    ('Pôle Jeunes Adultes', (SELECT id FROM departement WHERE acronyme = 'MJ' AND eglise_id = (SELECT id FROM eglise WHERE nom = 'Église Évangélique de Paris Centre'))),
    ('Pôle Chorale', (SELECT id FROM departement WHERE acronyme = 'ML' AND eglise_id = (SELECT id FROM eglise WHERE nom = 'Église Évangélique de Paris Centre'))),
    ('Pôle Musiciens', (SELECT id FROM departement WHERE acronyme = 'ML' AND eglise_id = (SELECT id FROM eglise WHERE nom = 'Église Évangélique de Paris Centre')));
