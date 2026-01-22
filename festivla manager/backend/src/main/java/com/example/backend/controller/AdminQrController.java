package com.example.backend.controller;

import com.example.backend.domain.entity.Waiting;
import com.example.backend.dto.request.QrVerifyRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.QrVerifyResponse;
import com.example.backend.service.QrCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "관리자 QR 코드", description = "관리자용 QR 코드 검증 API")
@RestController
@RequestMapping("/api/admin/qr")
@RequiredArgsConstructor
public class AdminQrController {

    private final QrCodeService qrCodeService;

    @Operation(summary = "QR 코드 검증", description = "관리자가 스캔한 QR 코드를 검증합니다")
    @PostMapping("/verify")
    public ApiResponse<QrVerifyResponse> verifyQrCode(
            @Valid @RequestBody QrVerifyRequest request) {
        
        Waiting waiting = qrCodeService.verifyQrCode(request.getQrData());
        
        if (waiting == null) {
            QrVerifyResponse response = QrVerifyResponse.builder()
                    .isValid(false)
                    .message("유효하지 않은 QR 코드입니다. 다시 스캔해주세요.")
                    .build();
            return ApiResponse.success(response);
        }

        QrVerifyResponse response = QrVerifyResponse.builder()
                .waitingId(waiting.getId())
                .userId(waiting.getUser().getId())
                .userNickname(waiting.getUser().getNickname())
                .headCount(waiting.getHeadCount())
                .isValid(true)
                .message("유효한 입장권입니다")
                .build();

        return ApiResponse.success(response);
    }
}
