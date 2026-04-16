package com.gestionclient.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class PaginationUtil {

    private PaginationUtil() {}

    public static Pageable creerPageable(int page, int taille, String tri, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(tri).descending()
                : Sort.by(tri).ascending();
        return creerPageable(page, taille, sort);
    }

    public static Pageable creerPageable(int page, int taille, Sort sort) {
        return PageRequest.of(Math.max(0, page), Math.min(taille, 100), sort);
    }
}
