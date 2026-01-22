package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.DashboardStatsResponse;
import com.example.backend.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "관리자 대시보드", description = "관리자 대시보드 통계 API")
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "대시보드 통계 조회", description = "대시보드에 표시할 통계 정보를 조회합니다")
    @GetMapping("/stats")
    public ApiResponse<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse response = dashboardService.getDashboardStats();
        return ApiResponse.success(response);
    }
}
