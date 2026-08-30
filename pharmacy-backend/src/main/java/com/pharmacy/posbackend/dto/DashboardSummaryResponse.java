package com.pharmacy.posbackend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardSummaryResponse {
    private BigDecimal todaySales;
    private Long todayOrdersCount;
    private BigDecimal monthlySales;
    private Long lowStockItemsCount;
    private Long expiringSoonBatchesCount;
}