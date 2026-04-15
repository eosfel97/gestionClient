package com.gestionclient.controller;


import com.gestionclient.dto.DashboardResponse;
import com.gestionclient.entity.User;
import com.gestionclient.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * GET /api/dashboard/stats
     * Récupérer toutes les statistiques du dashboard
     * - Admin : stats globales
     * - Commercial : ses propres stats
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardResponse> getStats(
            @AuthenticationPrincipal User currentUser) {

        DashboardResponse response = dashboardService.getStats(currentUser);
        return ResponseEntity.ok(response);
    }
}