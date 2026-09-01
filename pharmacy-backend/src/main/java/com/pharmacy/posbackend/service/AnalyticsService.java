package com.pharmacy.posbackend.service;

import com.pharmacy.posbackend.dto.DashboardSummaryResponse;
import com.pharmacy.posbackend.dto.LowStockResponse;
import com.pharmacy.posbackend.entity.Batch;
import com.pharmacy.posbackend.entity.Order;
import com.pharmacy.posbackend.repository.BatchRepository;
import com.pharmacy.posbackend.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;


@Service
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final BatchRepository batchRepository;

    public AnalyticsService(OrderRepository orderRepository, BatchRepository batchRepository) {
        this.orderRepository = orderRepository;
        this.batchRepository = batchRepository;
    }

    public DashboardSummaryResponse getDashboardSummary() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();

        List<Order> todayOrders = orderRepository.findByOrderDateBetween(startOfDay, endOfDay);
        List<Order> monthOrders = orderRepository.findByOrderDateBetween(startOfMonth, endOfDay);

        BigDecimal todaySales = todayOrders.stream()
                .map(Order::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal monthlySales = monthOrders.stream()
                .map(Order::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Object[]> lowStockMedicines = batchRepository.findLowStockMedicines(50); // Threshold 50 units
        List<Batch> expiringBatches = batchRepository.findByExpiryDateBetween(today, today.plusDays(30)); // 30 Days

        return DashboardSummaryResponse.builder()
                .todaySales(todaySales)
                .todayOrdersCount((long) todayOrders.size())
                .monthlySales(monthlySales)
                .lowStockItemsCount((long) lowStockMedicines.size())
                .expiringSoonBatchesCount((long) expiringBatches.size())
                .build();
    }

    public List<LowStockResponse> getLowStockAlerts(int threshold) {
        List<Object[]> results = batchRepository.findLowStockMedicines(threshold);
        List<LowStockResponse> responses = new ArrayList<>();

        for (Object[] row : results) {
            responses.add(LowStockResponse.builder()
                    .medicineId((Long) row[0])
                    .medicineName((String) row[1])
                    .brand((String) row[2])
                    .totalStock(((Number) row[3]).intValue())
                    .build());
        }
        return responses;
    }

    public List<Batch> getExpiringSoonBatches(int days) {
        LocalDate today = LocalDate.now();
        return batchRepository.findByExpiryDateBetween(today, today.plusDays(days));
    }
}