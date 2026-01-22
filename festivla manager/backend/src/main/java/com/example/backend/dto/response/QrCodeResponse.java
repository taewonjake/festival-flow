package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class QrCodeResponse {

    private String qrCodeUrl; // QR 코드 이미지 URL
    private String qrData; // QR 코드 데이터 (디버깅용, 실제로는 보안상 제외 가능)
    private Long timeRemaining; // 남은 시간 (초)
    private Long waitingId;
}
