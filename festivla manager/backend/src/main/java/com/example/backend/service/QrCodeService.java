package com.example.backend.service;

import com.example.backend.domain.entity.Waiting;
import com.example.backend.repository.WaitingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * QR 코드 생성 서비스
 * Google Charts API를 사용하여 QR 코드 이미지 URL 생성
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QrCodeService {

    private final TotpService totpService;
    private final WaitingRepository waitingRepository;

    /**
     * QR 코드 데이터 생성 (TOTP 코드 포함)
     * 형식: waitingId:totpCode
     */
    public String generateQrData(Long waitingId) {
        Waiting waiting = waitingRepository.findById(waitingId)
                .orElseThrow(() -> new IllegalArgumentException("웨이팅을 찾을 수 없습니다."));

        // Secret이 없으면 생성
        if (waiting.getTotpSecret() == null || waiting.getTotpSecret().isEmpty()) {
            String secret = totpService.generateSecret();
            waiting.setTotpSecret(secret);
            waitingRepository.save(waiting);
        }

        // 현재 TOTP 코드 생성
        String totpCode = totpService.generateCode(waiting.getTotpSecret());

        // QR 데이터 형식: waitingId:totpCode
        return waitingId + ":" + totpCode;
    }

    /**
     * QR 코드 이미지 URL 생성 (Google Charts API)
     */
    public String generateQrCodeUrl(Long waitingId) {
        String qrData = generateQrData(waitingId);
        String encodedData = URLEncoder.encode(qrData, StandardCharsets.UTF_8);
        
        // Google Charts API를 사용한 QR 코드 URL
        return String.format(
                "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=%s",
                encodedData
        );
    }

    /**
     * QR 코드 검증
     * @param qrData 스캔된 QR 코드 데이터 (형식: waitingId:totpCode)
     * @return 검증 성공 시 Waiting 엔티티, 실패 시 null
     */
    @Transactional(readOnly = true)
    public Waiting verifyQrCode(String qrData) {
        try {
            String[] parts = qrData.split(":");
            if (parts.length != 2) {
                log.warn("잘못된 QR 코드 형식: {}", qrData);
                return null;
            }

            Long waitingId = Long.parseLong(parts[0]);
            String totpCode = parts[1];

            Waiting waiting = waitingRepository.findById(waitingId)
                    .orElse(null);

            if (waiting == null) {
                log.warn("웨이팅을 찾을 수 없음: {}", waitingId);
                return null;
            }

            if (waiting.getTotpSecret() == null || waiting.getTotpSecret().isEmpty()) {
                log.warn("TOTP Secret이 없음: {}", waitingId);
                return null;
            }

            // TOTP 코드 검증
            boolean isValid = totpService.verifyCode(waiting.getTotpSecret(), totpCode);
            if (!isValid) {
                log.warn("TOTP 코드 검증 실패: waitingId={}, code={}", waitingId, totpCode);
                return null;
            }

            // 웨이팅 상태 확인 (CALLED 상태만 입장 가능)
            if (waiting.getStatus() != com.example.backend.domain.enums.WaitingStatus.CALLED) {
                log.warn("입장 가능한 상태가 아님: waitingId={}, status={}", waitingId, waiting.getStatus());
                return null;
            }

            return waiting;
        } catch (Exception e) {
            log.error("QR 코드 검증 중 오류 발생", e);
            return null;
        }
    }
}
