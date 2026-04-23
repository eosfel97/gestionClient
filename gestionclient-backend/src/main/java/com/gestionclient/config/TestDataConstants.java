package com.gestionclient.config;

import com.gestionclient.enums.StatutClient;

/**
 * Constantes (jeux de donnees) utilisees pour l'initialisation des donnees de test.
 */
final class TestDataConstants {

    private TestDataConstants() {}

    static final int CLIENTS_PAR_COMMERCIAL = 20;

    static final String[][] COMMERCIAUX = {
            {"Martin",    "Sophie",   "sophie.martin@crm.com"},
            {"Bernard",   "Lucas",    "lucas.bernard@crm.com"},
            {"Thomas",    "Emma",     "emma.thomas@crm.com"},
            {"Petit",     "Hugo",     "hugo.petit@crm.com"},
            {"Robert",    "Lea",      "lea.robert@crm.com"},
            {"Richard",   "Nathan",   "nathan.richard@crm.com"},
            {"Durand",    "Camille",  "camille.durand@crm.com"},
            {"Moreau",    "Theo",     "theo.moreau@crm.com"},
            {"Simon",     "Chloe",    "chloe.simon@crm.com"},
            {"Laurent",   "Mathieu",  "mathieu.laurent@crm.com"},
    };

    static final String[][] PERSONNES = {
            {"Dumont","Alice"},     {"Girard","Paul"},      {"Lefebvre","Marie"},   {"Leroy","Julien"},
            {"Morel","Clara"},      {"Fournier","Antoine"}, {"Giraud","Ines"},      {"Bonnet","Nicolas"},
            {"Mercier","Sarah"},    {"Dupuis","Thomas"},    {"Lemaire","Julie"},    {"Chevalier","Kevin"},
            {"Robin","Laura"},      {"Benoit","Alexis"},    {"Rousseau","Eva"},     {"Garnier","Romain"},
            {"Clement","Lucie"},    {"Gauthier","Pierre"},  {"Perrin","Mia"},       {"Blanc","Remi"},
            {"Roux","Olivia"},      {"Vincent","Maxime"},   {"Fontaine","Jade"},    {"Chevallier","Adam"},
            {"Barbier","Zoe"},      {"Brun","Ethan"},       {"Dumas","Lina"},       {"Carpentier","Noah"},
            {"Arnaud","Mila"},      {"Renaud","Louis"},     {"Marchand","Alice"},   {"Dufour","Gabriel"},
            {"Joly","Sofia"},       {"Schmitt","Raphael"},  {"Aubert","Emma"},      {"Olivier","Leo"},
            {"Meyer","Manon"},      {"Nicolas","Arthur"},   {"Lucas","Lou"},        {"Henry","Jules"},
    };

    static final String[] ENTREPRISES = {
            "TechSolutions", "InnovaGroup", "DataCorp",   "CloudSys",     "WebFactory",
            "SmartBuild",    "DigitalHub",  "AlphaTech",  "NeoAgency",    "FutureSoft",
            "MediaPlus",     "BioTech",     "EcoSolutions","CyberNet",    "StartupLab",
            "OpenData",      "FinTechPro",  "LogiSmart",  "AgroTech",     "ConstrucPro",
    };

    static final StatutClient[] STATUTS = {
            StatutClient.ACTIF, StatutClient.PROSPECT, StatutClient.INACTIF
    };

    static final String[] VOIES = {
            "rue", "avenue", "boulevard", "place", "impasse", "allee", "chemin", "cours"
    };

    static final String[] NOMS_RUES = {
            "de la Republique",    "Victor Hugo",       "Jean Jaures",       "des Lilas",
            "du General de Gaulle","Pasteur",           "Gambetta",          "des Acacias",
            "de la Paix",          "Voltaire",          "de la Gare",        "des Ecoles",
            "Emile Zola",          "des Champs",        "de Verdun",         "Saint-Martin",
            "du Moulin",           "de la Liberte",     "Moliere",           "des Roses",
    };

    static final String[][] VILLES = {
            {"75001", "Paris"},       {"69001", "Lyon"},        {"13001", "Marseille"},
            {"31000", "Toulouse"},    {"06000", "Nice"},        {"44000", "Nantes"},
            {"67000", "Strasbourg"},  {"34000", "Montpellier"}, {"33000", "Bordeaux"},
            {"59000", "Lille"},       {"35000", "Rennes"},      {"76000", "Rouen"},
            {"38000", "Grenoble"},    {"21000", "Dijon"},       {"49000", "Angers"},
    };
}