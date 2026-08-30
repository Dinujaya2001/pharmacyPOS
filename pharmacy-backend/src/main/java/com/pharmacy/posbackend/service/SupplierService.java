package com.pharmacy.posbackend.service;

import com.pharmacy.posbackend.dto.PurchaseOrderItemRequest;
import com.pharmacy.posbackend.dto.PurchaseOrderRequest;
import com.pharmacy.posbackend.dto.PurchaseOrderResponse;
import com.pharmacy.posbackend.dto.SupplierDTO;
import com.pharmacy.posbackend.entity.*;
import com.pharmacy.posbackend.repository.BatchRepository;
import com.pharmacy.posbackend.repository.MedicineRepository;
import com.pharmacy.posbackend.repository.PurchaseOrderRepository;
import com.pharmacy.posbackend.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;

    public SupplierService(SupplierRepository supplierRepository,
                           PurchaseOrderRepository purchaseOrderRepository,
                           MedicineRepository medicineRepository,
                           BatchRepository batchRepository) {
        this.supplierRepository = supplierRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
    }

    // --- Supplier CRUD ---
    public Supplier addSupplier(SupplierDTO dto) {
        Supplier supplier = Supplier.builder()
                .name(dto.getName())
                .contactPerson(dto.getContactPerson())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .build();
        return supplierRepository.save(supplier);
    }

    public List<Supplier> getAllActiveSuppliers() {
        return supplierRepository.findByActiveTrue();
    }

    // --- GRN / Purchase Order Operations ---
    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<PurchaseOrderItem> orderItems = new ArrayList<>();

        PurchaseOrder purchaseOrder = PurchaseOrder.builder()
                .grnNumber("GRN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .supplier(supplier)
                .status(PurchaseOrderStatus.RECEIVED)
                .receivedDate(LocalDateTime.now())
                .build();

        for (PurchaseOrderItemRequest itemReq : request.getItems()) {
            Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                    .orElseThrow(() -> new RuntimeException("Medicine not found ID: " + itemReq.getMedicineId()));

            BigDecimal subTotal = itemReq.getBuyingPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(subTotal);

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(purchaseOrder)
                    .medicine(medicine)
                    .batchNumber(itemReq.getBatchNumber())
                    .expiryDate(itemReq.getExpiryDate())
                    .manufactureDate(itemReq.getManufactureDate())
                    .quantity(itemReq.getQuantity())
                    .buyingPrice(itemReq.getBuyingPrice())
                    .sellingPrice(itemReq.getSellingPrice())
                    .subTotal(subTotal)
                    .build();

            orderItems.add(item);

            // GRN එක ලැබුණු පසු ස්වයංක්‍රීයව Batch Table එකේ Stock වැඩි කිරීම
            Batch batch = batchRepository.findByBatchNumber(itemReq.getBatchNumber())
                    .map(existingBatch -> {
                        existingBatch.setQuantity(existingBatch.getQuantity() + itemReq.getQuantity());
                        existingBatch.setBuyingPrice(itemReq.getBuyingPrice());
                        existingBatch.setSellingPrice(itemReq.getSellingPrice());
                        return existingBatch;
                    })
                    .orElseGet(() -> Batch.builder()
                            .batchNumber(itemReq.getBatchNumber())
                            .expiryDate(itemReq.getExpiryDate())
                            .manufactureDate(itemReq.getManufactureDate())
                            .buyingPrice(itemReq.getBuyingPrice())
                            .sellingPrice(itemReq.getSellingPrice())
                            .quantity(itemReq.getQuantity())
                            .medicine(medicine)
                            .build());

            batchRepository.save(batch);
        }

        purchaseOrder.setTotalAmount(totalAmount);
        purchaseOrder.setItems(orderItems);

        PurchaseOrder savedOrder = purchaseOrderRepository.save(purchaseOrder);
        return mapToResponse(savedOrder);
    }

    public List<PurchaseOrderResponse> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PurchaseOrderResponse mapToResponse(PurchaseOrder order) {
        List<PurchaseOrderResponse.PurchaseOrderItemDTO> items = order.getItems().stream()
                .map(item -> PurchaseOrderResponse.PurchaseOrderItemDTO.builder()
                        .medicineName(item.getMedicine().getName())
                        .batchNumber(item.getBatchNumber())
                        .quantity(item.getQuantity())
                        .buyingPrice(item.getBuyingPrice())
                        .sellingPrice(item.getSellingPrice())
                        .subTotal(item.getSubTotal())
                        .build())
                .collect(Collectors.toList());

        return PurchaseOrderResponse.builder()
                .id(order.getId())
                .grnNumber(order.getGrnNumber())
                .supplierName(order.getSupplier().getName())
                .orderDate(order.getOrderDate())
                .receivedDate(order.getReceivedDate())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .items(items)
                .build();
    }
}