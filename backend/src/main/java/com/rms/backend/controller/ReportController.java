package com.rms.backend.controller;

import com.rms.backend.dto.response.ApiResponse;
import com.rms.backend.entity.Order;
import com.rms.backend.entity.RestaurantTable;
import com.rms.backend.repository.OrderRepository;
import com.rms.backend.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final OrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        LocalDateTime startDateTime = (start != null) ? start : LocalDateTime.now().minusDays(30);
        LocalDateTime endDateTime = (end != null) ? end : LocalDateTime.now().plusDays(1);

        Double totalRevenue = orderRepository.getTotalRevenueBetween(startDateTime, endDateTime);
        if (totalRevenue == null) {
            totalRevenue = 0.0;
        }

        Map<String, Object> data = new HashMap<>();
        data.put("totalRevenue", BigDecimal.valueOf(totalRevenue).setScale(2, java.math.RoundingMode.HALF_UP));
        data.put("startDate", startDateTime);
        data.put("endDate", endDateTime);

        return ResponseEntity.ok(ApiResponse.success("Revenue fetched", data));
    }

    @GetMapping("/top-items")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopItems() {
        List<Object[]> raw = orderRepository.findTopSellingItems();
        List<Map<String, Object>> result = new ArrayList<>();

        if (raw != null) {
            for (Object[] row : raw) {
                if (row != null && row.length >= 2) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("itemName", row[0] != null ? row[0].toString() : "Unknown");
                    item.put("totalSold", row[1] != null ? ((Number) row[1]).longValue() : 0L);
                    result.add(item);
                }
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Top selling items fetched", result));
    }

    @GetMapping("/table-occupancy")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTableOccupancy() {
        List<RestaurantTable> tables = tableRepository.findAll();
        long total = tables.size();
        long available = tables.stream().filter(t -> t.getStatus() == RestaurantTable.TableStatus.AVAILABLE).count();
        long occupied = tables.stream().filter(t -> t.getStatus() == RestaurantTable.TableStatus.OCCUPIED).count();
        long reserved = tables.stream().filter(t -> t.getStatus() == RestaurantTable.TableStatus.RESERVED).count();

        int rate = total > 0 ? (int) Math.round(((double) occupied / total) * 100) : 0;

        Map<String, Object> data = new HashMap<>();
        data.put("total", total);
        data.put("available", available);
        data.put("occupied", occupied);
        data.put("reserved", reserved);
        data.put("occupancyRate", rate + "%");

        return ResponseEntity.ok(ApiResponse.success("Table occupancy fetched", data));
    }
}
