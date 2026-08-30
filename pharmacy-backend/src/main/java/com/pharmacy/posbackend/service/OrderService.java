package com.pharmacy.posbackend.service;

import com.pharmacy.posbackend.dto.OrderItemRequest;
import com.pharmacy.posbackend.dto.OrderRequest;
import com.pharmacy.posbackend.dto.OrderResponse;
import com.pharmacy.posbackend.entity.*;
import com.pharmacy.posbackend.repository.BatchRepository;
import com.pharmacy.posbackend.repository.OrderRepository;
import com.pharmacy.posbackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final BatchRepository batchRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        BatchRepository batchRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.batchRepository = batchRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request, String cashierUsername) {
        User cashier = userRepository.findByUsername(cashierUsername)
                .orElseThrow(() -> new RuntimeException("Cashier not found"));

        User customer = null;
        if (request.getCustomerId() != null) {
            customer = userRepository.findById(request.getCustomerId()).orElse(null);
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .invoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .paymentMethod(request.getPaymentMethod())
                .status(OrderStatus.COMPLETED)
                .cashier(cashier)
                .customer(customer)
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
                .build();

        for (OrderItemRequest itemReq : request.getItems()) {
            Batch batch = batchRepository.findById(itemReq.getBatchId())
                    .orElseThrow(() -> new RuntimeException("Batch not found ID: " + itemReq.getBatchId()));

            if (batch.getQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for batch: " + batch.getBatchNumber());
            }

            // Stock අඩු කිරීම
            batch.setQuantity(batch.getQuantity() - itemReq.getQuantity());
            batchRepository.save(batch);

            BigDecimal subTotal = batch.getSellingPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(subTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .batch(batch)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(batch.getSellingPrice())
                    .subTotal(subTotal)
                    .build();

            orderItems.add(orderItem);
        }

        BigDecimal netAmount = totalAmount.subtract(order.getDiscountAmount());

        order.setTotalAmount(totalAmount);
        order.setNetAmount(netAmount.compareTo(BigDecimal.ZERO) > 0 ? netAmount : BigDecimal.ZERO);
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        return mapToResponse(savedOrder);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderByInvoice(String invoiceNumber) {
        Order order = orderRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceNumber));
        return mapToResponse(order);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderResponse.OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(item -> OrderResponse.OrderItemResponse.builder()
                        .medicineName(item.getBatch().getMedicine().getName())
                        .batchNumber(item.getBatch().getBatchNumber())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subTotal(item.getSubTotal())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .invoiceNumber(order.getInvoiceNumber())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .netAmount(order.getNetAmount())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .cashierName(order.getCashier().getFullName())
                .items(itemResponses)
                .build();
    }
}
