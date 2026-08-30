package com.pharmacy.posbackend.controller;

import com.pharmacy.posbackend.dto.PurchaseOrderRequest;
import com.pharmacy.posbackend.dto.PurchaseOrderResponse;
import com.pharmacy.posbackend.dto.SupplierDTO;
import com.pharmacy.posbackend.entity.Supplier;
import com.pharmacy.posbackend.service.SupplierService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/suppliers")
@CrossOrigin(origins = "*")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<Supplier> addSupplier(@RequestBody SupplierDTO dto) {
        return ResponseEntity.ok(supplierService.addSupplier(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<Supplier>> getSuppliers() {
        return ResponseEntity.ok(supplierService.getAllActiveSuppliers());
    }

    @PostMapping("/grn")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<PurchaseOrderResponse> createGRN(@RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.ok(supplierService.createPurchaseOrder(request));
    }

    @GetMapping("/grn")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<PurchaseOrderResponse>> getAllGRNs() {
        return ResponseEntity.ok(supplierService.getAllPurchaseOrders());
    }
}
