package com.pharmacy.posbackend.dto;

import lombok.Data;
import java.util.List;

@Data
public class PurchaseOrderRequest {
    private Long supplierId;
    private List<PurchaseOrderItemRequest> items;
}