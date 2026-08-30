package com.pharmacy.posbackend.dto;

import com.pharmacy.posbackend.entity.PaymentMethod;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {
    private PaymentMethod paymentMethod;
    private BigDecimal discountAmount;
    private Long customerId;
    private List<OrderItemRequest> items;
}