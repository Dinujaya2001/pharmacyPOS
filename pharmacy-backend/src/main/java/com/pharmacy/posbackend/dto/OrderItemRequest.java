package com.pharmacy.posbackend.dto;

import lombok.Data;

@Data
public class OrderItemRequest {
    private Long batchId;
    private Integer quantity;
}
