package com.pharmacy.posbackend.controller;

import com.pharmacy.posbackend.dto.DashboardSummaryResponse;
import com.pharmacy.posbackend.dto.LowStockResponse;
import com.pharmacy.posbackend.entity.Batch;
import com.pharmacy.posbackend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        return ResponseEntity.ok(analyticsService.getDashboardSummary());
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<LowStockResponse>> getLowStock(@RequestParam(defaultValue = "50") int threshold) {
        return ResponseEntity.ok(analyticsService.getLowStockAlerts(threshold));
    }

    @GetMapping("/expiring-soon")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<Batch>> getExpiringSoon(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getExpiringSoonBatches(days));
    }
}
