package com.pharmacy.posbackend.service;

import com.pharmacy.posbackend.dto.PrescriptionResponse;
import com.pharmacy.posbackend.entity.Prescription;
import com.pharmacy.posbackend.entity.PrescriptionStatus;
import com.pharmacy.posbackend.entity.User;
import com.pharmacy.posbackend.repository.PrescriptionRepository;
import com.pharmacy.posbackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;
    private final Path fileStorageLocation = Paths.get("uploads/prescriptions").toAbsolutePath().normalize();

    public PrescriptionService(PrescriptionRepository prescriptionRepository, UserRepository userRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.userRepository = userRepository;

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create upload directory", ex);
        }
    }

    public PrescriptionResponse uploadPrescription(MultipartFile file, String notes, String deliveryAddress,
                                                   String contactNumber, String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String newFileName = UUID.randomUUID().toString() + fileExtension;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileDownloadUri = "/api/v1/prescriptions/files/" + newFileName;

            Prescription prescription = Prescription.builder()
                    .imageUrl(fileDownloadUri)
                    .notes(notes)
                    .deliveryAddress(deliveryAddress)
                    .contactNumber(contactNumber)
                    .status(PrescriptionStatus.PENDING)
                    .customer(customer)
                    .build();

            Prescription saved = prescriptionRepository.save(prescription);
            return mapToResponse(saved);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + newFileName, ex);
        }
    }

    public List<PrescriptionResponse> getAllPrescriptions() {
        return prescriptionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PrescriptionResponse> getMyPrescriptions(String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return prescriptionRepository.findByCustomerId(customer.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PrescriptionResponse updateStatus(Long id, PrescriptionStatus status) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        prescription.setStatus(status);
        return mapToResponse(prescriptionRepository.save(prescription));
    }

    private PrescriptionResponse mapToResponse(Prescription prescription) {
        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .imageUrl(prescription.getImageUrl())
                .notes(prescription.getNotes())
                .deliveryAddress(prescription.getDeliveryAddress())
                .contactNumber(prescription.getContactNumber())
                .status(prescription.getStatus())
                .customerUsername(prescription.getCustomer().getUsername())
                .customerFullName(prescription.getCustomer().getFullName())
                .uploadedAt(prescription.getUploadedAt())
                .build();
    }
}