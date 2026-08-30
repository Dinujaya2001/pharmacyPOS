package com.pharmacy.posbackend.dto;

import lombok.Data;

@Data
public class MedicineRequest {
    private String name;
    private String genericName;
    private String brand;
    private String dosageForm;
    private String strength;
    private boolean prescriptionRequired;
    private Long categoryId;
}