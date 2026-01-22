package com.example.backend.controller;

import com.example.backend.dto.request.WaitingRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.WaitingResponse;
import com.example.backend.service.WaitingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "웨이팅", description = "웨이팅 관리 API")
@RestController
@RequestMapping("/api/waitings")
@RequiredArgsConstructor
public class WaitingController {

    private final WaitingService waitingService;

    @Operation(summary = "웨이팅 등록", description = "학생이 웨이팅을 등록합니다")
    @PostMapping
    public ApiResponse<WaitingResponse> joinWaiting(
            @Parameter(description = "사용자 ID", required = true)
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody WaitingRequest request) {
        WaitingResponse response = waitingService.joinWaiting(userId, request);
        return ApiResponse.success("웨이팅 등록 성공", response);
    }

    @Operation(summary = "내 웨이팅 조회", description = "현재 사용자의 웨이팅 정보를 조회합니다")
    @GetMapping("/me")
    public ApiResponse<WaitingResponse> getMyWaiting(
            @Parameter(description = "사용자 ID", required = true)
            @RequestHeader("X-User-Id") Long userId) {
        WaitingResponse response = waitingService.getMyWaiting(userId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "웨이팅 취소", description = "학생이 자신의 웨이팅을 취소합니다")
    @DeleteMapping("/{waitingId}")
    public ApiResponse<Object> cancelWaiting(
            @Parameter(description = "웨이팅 ID", required = true)
            @PathVariable Long waitingId,
            @Parameter(description = "사용자 ID", required = true)
            @RequestHeader("X-User-Id") Long userId) {
        waitingService.cancelWaiting(waitingId, userId);
        return ApiResponse.success("웨이팅이 취소되었습니다", null);
    }

}
