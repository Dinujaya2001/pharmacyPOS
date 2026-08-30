package com.pharmacy.posbackend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LowStockResponse {
    private Long medicineId;
    private String medicineName;
    private String brand;
    private Integer totalStock;
}
