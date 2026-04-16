package com.gestionclient.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

public final class PaginationUtil {

    private static final int PAGE_MAX = 9999;

    private PaginationUtil() {}

    public static String validerTri(String tri, Set<String> champsAutorises, String defaut) {
        return champsAutorises.contains(tri) ? tri : defaut;
    }

    public static Pageable creerPageable(int page, int taille, String tri, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(tri).descending()
                : Sort.by(tri).ascending();
        return creerPageable(page, taille, sort);
    }

    public static Pageable creerPageable(int page, int taille, Sort sort) {
        return PageRequest.of(Math.min(Math.max(0, page), PAGE_MAX), Math.min(taille, 100), sort);
    }
}
