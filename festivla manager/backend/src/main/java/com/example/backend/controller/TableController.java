package com.example.backend.controller;

import com.example.backend.dto.request.TableStatusUpdateRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.TableResponse;
import com.example.backend.service.TableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "테이블", description = "테이블 관리 API (관리자용)")
@RestController
@RequestMapping("/api/admin/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;

    @Operation(summary = "전체 테이블 조회", description = "모든 테이블의 상태를 조회합니다")
    @GetMapping
    public ApiResponse<List<TableResponse>> getAllTables() {
        List<TableResponse> response = tableService.getAllTables();
        return ApiResponse.success(response);
    }

    @Operation(summary = "테이블 상태 변경", description = "테이블의 상태를 변경합니다")
    @PutMapping("/{tableId}/status")
    public ApiResponse<TableResponse> updateStatus(
            @Parameter(description = "테이블 ID", required = true)
            @PathVariable Long tableId,
            @Valid @RequestBody TableStatusUpdateRequest request) {
        TableResponse response = tableService.updateStatus(tableId, request);
        return ApiResponse.success("상태 변경 완료", response);
    }
}
