package com.pharmacy.posbackend.dto;

import com.pharmacy.posbackend.entity.PrescriptionStatus;
import lombok.Data;

@Data
public class PrescriptionStatusUpdateRequest {
    private PrescriptionStatus status;
}
