package com.pharmacy.posbackend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PurchaseOrderItemRequest {
    private Long medicineId;
    private String batchNumber;
    private LocalDate expiryDate;
    private LocalDate manufactureDate;
    private Integer quantity;
    private BigDecimal buyingPrice;
    private BigDecimal sellingPrice;
}