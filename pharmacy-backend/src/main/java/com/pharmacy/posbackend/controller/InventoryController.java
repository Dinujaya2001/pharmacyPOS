package com.pharmacy.posbackend.controller;

import com.pharmacy.posbackend.dto.BatchRequest;
import com.pharmacy.posbackend.dto.CategoryDTO;
import com.pharmacy.posbackend.dto.MedicineRequest;
import com.pharmacy.posbackend.entity.Batch;
import com.pharmacy.posbackend.entity.Category;
import com.pharmacy.posbackend.entity.Medicine;
import com.pharmacy.posbackend.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // Categories
    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<Category> createCategory(@RequestBody CategoryDTO dto) {
        return ResponseEntity.ok(inventoryService.addCategory(dto));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(inventoryService.getAllCategories());
    }

    // Medicines
    @PostMapping("/medicines")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<Medicine> createMedicine(@RequestBody MedicineRequest request) {
        return ResponseEntity.ok(inventoryService.addMedicine(request));
    }

    @GetMapping("/medicines")
    public ResponseEntity<List<Medicine>> getMedicines() {
        return ResponseEntity.ok(inventoryService.getAllMedicines());
    }

    // Batches
    @PostMapping("/batches")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<Batch> createBatch(@RequestBody BatchRequest request) {
        return ResponseEntity.ok(inventoryService.addBatch(request));
    }

    @GetMapping("/batches")
    public ResponseEntity<List<Batch>> getBatches() {
        return ResponseEntity.ok(inventoryService.getAllBatches());
    }

    @GetMapping("/batches/medicine/{id}")
    public ResponseEntity<List<Batch>> getBatchesByMedicine(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getBatchesByMedicine(id));
    }

    @GetMapping("/batches/expired")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<Batch>> getExpiredBatches() {
        return ResponseEntity.ok(inventoryService.getExpiredBatches());
    }
}
