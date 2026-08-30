package com.pharmacy.posbackend.controller;

import com.pharmacy.posbackend.dto.PrescriptionResponse;
import com.pharmacy.posbackend.dto.PrescriptionStatusUpdateRequest;
import com.pharmacy.posbackend.service.PrescriptionService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/v1/prescriptions")
@CrossOrigin(origins = "*")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final Path fileStorageLocation = Paths.get("uploads/prescriptions").toAbsolutePath().normalize();

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PrescriptionResponse> uploadPrescription(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam("deliveryAddress") String deliveryAddress,
            @RequestParam("contactNumber") String contactNumber,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(prescriptionService.uploadPrescription(file, notes, deliveryAddress, contactNumber, userDetails.getUsername()));
    }

    @GetMapping("/my-prescriptions")
    public ResponseEntity<List<PrescriptionResponse>> getMyPrescriptions(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(prescriptionService.getMyPrescriptions(userDetails.getUsername()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<PrescriptionResponse>> getAllPrescriptions() {
        return ResponseEntity.ok(prescriptionService.getAllPrescriptions());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<PrescriptionResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody PrescriptionStatusUpdateRequest request) {
        return ResponseEntity.ok(prescriptionService.updateStatus(id, request.getStatus()));
    }

    @GetMapping("/files/{fileName:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception ex) {
            return ResponseEntity.badRequest().build();
        }
    }
}