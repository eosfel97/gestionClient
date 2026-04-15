package com.gestionclient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {


    private long totalClients;
    private long clientsActifs;
    private long clientsProspects;
    private long clientsInactifs;

    private long totalTaches;
    private long tachesAFaire;
    private long tachesEnCours;
    private long tachesTerminees;
    private long tachesEnRetard;

    private long totalInteractions;
    private long interactionsCeMois;
    private long interactionsCetteSemaine;


    private Map<String, Long> interactionsParType;
    private Map<String, Long> tachesParPriorite;


    private List<InteractionResponse> dernieresInteractions;
    private List<TacheResponse> prochainesTaches;
    private List<TacheResponse> tachesEnRetardListe;
}