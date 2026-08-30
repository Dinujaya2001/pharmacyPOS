package com.pharmacy.posbackend.repository;

import com.pharmacy.posbackend.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByGrnNumber(String grnNumber);
}