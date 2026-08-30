package com.pharmacy.posbackend.dto;

import com.pharmacy.posbackend.entity.PrescriptionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PrescriptionResponse {
    private Long id;
    private String imageUrl;
    private String notes;
    private String deliveryAddress;
    private String contactNumber;
    private PrescriptionStatus status;
    private String customerUsername;
    private String customerFullName;
    private LocalDateTime uploadedAt;
}
