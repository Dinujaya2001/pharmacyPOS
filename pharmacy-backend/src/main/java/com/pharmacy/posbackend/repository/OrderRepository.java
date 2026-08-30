package com.pharmacy.posbackend.repository;

import com.pharmacy.posbackend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByInvoiceNumber(String invoiceNumber);
    List<Order> findByCashierId(Long cashierId);
    List<Order> findByOrderDateBetween(LocalDateTime start, LocalDateTime end);
}