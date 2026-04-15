package com.gestionclient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {

    private List<T> contenu;
    private int pageActuelle;
    private int taillePage;
    private long totalElements;
    private int totalPages;
    private boolean premiere;
    private boolean derniere;
}