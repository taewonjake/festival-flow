package com.example.backend.controller;

import com.example.backend.domain.enums.WaitingStatus;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.WaitingResponse;
import com.example.backend.service.WaitingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "관리자 웨이팅", description = "관리자용 웨이팅 관리 API")
@RestController
@RequestMapping("/api/admin/waitings")
@RequiredArgsConstructor
public class AdminWaitingController {

    private final WaitingService waitingService;

    @Operation(summary = "웨이팅 목록 조회", description = "관리자가 웨이팅 목록을 조회합니다")
    @GetMapping
    public ApiResponse<List<WaitingResponse>> getWaitingList(
            @Parameter(description = "웨이팅 상태 (선택사항)")
            @RequestParam(required = false) WaitingStatus status) {
        List<WaitingResponse> response = waitingService.getWaitingList(status);
        return ApiResponse.success(response);
    }

    @Operation(summary = "사용자 호출", description = "관리자가 사용자를 호출합니다")
    @PostMapping("/{waitingId}/call")
    public ApiResponse<WaitingResponse> callUser(
            @Parameter(description = "웨이팅 ID", required = true)
            @PathVariable Long waitingId) {
        WaitingResponse response = waitingService.callUser(waitingId);
        return ApiResponse.success("호출 완료", response);
    }

    @Operation(summary = "입장 확인", description = "관리자가 사용자 입장을 확인합니다")
    @PostMapping("/{waitingId}/confirm")
    public ApiResponse<WaitingResponse> confirmEntry(
            @Parameter(description = "웨이팅 ID", required = true)
            @PathVariable Long waitingId) {
        WaitingResponse response = waitingService.confirmEntry(waitingId);
        return ApiResponse.success("입장 확인 완료", response);
    }

    @Operation(summary = "웨이팅 취소 (관리자)", description = "관리자가 웨이팅을 취소합니다")
    @DeleteMapping("/{waitingId}")
    public ApiResponse<WaitingResponse> cancelWaiting(
            @Parameter(description = "웨이팅 ID", required = true)
            @PathVariable Long waitingId) {
        WaitingResponse response = waitingService.cancelWaitingByAdmin(waitingId);
        return ApiResponse.success("웨이팅이 취소되었습니다", response);
    }

    @Operation(summary = "테이블 할당", description = "관리자가 웨이팅에 테이블을 할당합니다")
    @PostMapping("/{waitingId}/assign")
    public ApiResponse<WaitingResponse> assignTable(
            @Parameter(description = "웨이팅 ID", required = true)
            @PathVariable Long waitingId,
            @Parameter(description = "테이블 ID", required = true)
            @RequestBody java.util.Map<String, Long> request) {
        Long tableId = request.get("tableId");
        WaitingResponse response = waitingService.assignTable(waitingId, tableId);
        return ApiResponse.success("테이블 할당 완료", response);
    }
}
