package com.gestionclient.config;

import com.gestionclient.enums.Priorite;
import com.gestionclient.enums.StatutTache;
import com.gestionclient.enums.TypeInteraction;

import java.text.Normalizer;

/**
 * Fonctions utilitaires pour la generation de donnees de test.
 */
final class TestDataHelpers {

    private TestDataHelpers() {}

    static TypeInteraction typePour(int i) {
        return switch (i % 3) {
            case 0 -> TypeInteraction.APPEL;
            case 1 -> TypeInteraction.EMAIL;
            default -> TypeInteraction.REUNION;
        };
    }

    static Priorite prioritePour(int i) {
        return switch (i % 3) {
            case 0 -> Priorite.HAUTE;
            case 1 -> Priorite.MOYENNE;
            default -> Priorite.BASSE;
        };
    }

    static StatutTache statutTachePour(int i) {
        return switch (i % 3) {
            case 0 -> StatutTache.A_FAIRE;
            case 1 -> StatutTache.EN_COURS;
            default -> StatutTache.TERMINEE;
        };
    }

    static String slug(String s) {
        String n = Normalizer.normalize(s, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]", "");
        return n.isBlank() ? "x" : n;
    }

    /**
     * Construit une adresse variee a partir d'un index global.
     */
    static String construireAdresse(int index) {
        int numero = (index * 7) % 250 + 1;
        String voie = TestDataConstants.VOIES[index % TestDataConstants.VOIES.length];
        String nomRue = TestDataConstants.NOMS_RUES[(index / TestDataConstants.VOIES.length)
                % TestDataConstants.NOMS_RUES.length];
        String[] ville = TestDataConstants.VILLES[index % TestDataConstants.VILLES.length];
        return numero + " " + voie + " " + nomRue + ", " + ville[0] + " " + ville[1];
    }
}