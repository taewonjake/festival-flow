package com.example.backend.controller;

import com.example.backend.dto.request.QrVerifyRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.QrCodeResponse;
import com.example.backend.dto.response.QrVerifyResponse;
import com.example.backend.service.QrCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "QR 코드", description = "QR 코드 생성 및 검증 API")
@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
public class QrCodeController {

    private final QrCodeService qrCodeService;

    @Operation(summary = "QR 코드 생성", description = "학생이 입장용 QR 코드를 생성합니다 (30초마다 갱신)")
    @GetMapping("/generate/{waitingId}")
    public ApiResponse<QrCodeResponse> generateQrCode(
            @Parameter(description = "웨이팅 ID", required = true)
            @PathVariable Long waitingId,
            @Parameter(description = "사용자 ID", required = true)
            @RequestHeader("X-User-Id") Long userId) {
        
        // QR 코드 데이터 및 URL 생성
        String qrData = qrCodeService.generateQrData(waitingId);
        String qrCodeUrl = qrCodeService.generateQrCodeUrl(waitingId);
        
        // 현재 시간 기준으로 남은 시간 계산 (30초 주기)
        long currentTimeSeconds = System.currentTimeMillis() / 1000;
        long timeStep = currentTimeSeconds / 30;
        long nextTimeStep = timeStep + 1;
        long nextTimeStepSeconds = nextTimeStep * 30;
        long timeRemaining = nextTimeStepSeconds - currentTimeSeconds;

        QrCodeResponse response = QrCodeResponse.builder()
                .qrCodeUrl(qrCodeUrl)
                .qrData(qrData) // 실제 운영 시 보안상 제외 가능
                .timeRemaining(timeRemaining)
                .waitingId(waitingId)
                .build();

        return ApiResponse.success(response);
    }
}
