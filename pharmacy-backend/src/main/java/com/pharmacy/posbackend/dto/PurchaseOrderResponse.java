package com.pharmacy.posbackend.dto;

import com.pharmacy.posbackend.entity.PurchaseOrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PurchaseOrderResponse {
    private Long id;
    private String grnNumber;
    private String supplierName;
    private LocalDateTime orderDate;
    private LocalDateTime receivedDate;
    private BigDecimal totalAmount;
    private PurchaseOrderStatus status;
    private List<PurchaseOrderItemDTO> items;

    @Data
    @Builder
    public static class PurchaseOrderItemDTO {
        private String medicineName;
        private String batchNumber;
        private Integer quantity;
        private BigDecimal buyingPrice;
        private BigDecimal sellingPrice;
        private BigDecimal subTotal;
    }
}
