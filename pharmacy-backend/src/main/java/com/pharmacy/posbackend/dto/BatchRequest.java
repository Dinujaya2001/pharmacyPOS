package com.pharmacy.posbackend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BatchRequest {
    private String batchNumber;
    private LocalDate expiryDate;
    private LocalDate manufactureDate;
    private BigDecimal buyingPrice;
    private BigDecimal sellingPrice;
    private Integer quantity;
    private Long medicineId;
}