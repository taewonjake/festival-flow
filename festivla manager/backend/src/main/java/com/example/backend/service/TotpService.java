package com.example.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

/**
 * TOTP (Time-based One-Time Password) 서비스
 * RFC 6238 표준을 따름
 */
@Slf4j
@Service
public class TotpService {

    private static final String HMAC_SHA1_ALGORITHM = "HmacSHA1";
    private static final int TIME_STEP_SECONDS = 30; // 30초 간격
    private static final int CODE_DIGITS = 6; // 6자리 코드
    private static final int SECRET_LENGTH = 20; // 20바이트 (Base32로 인코딩 시 32자)

    /**
     * TOTP Secret 생성 (Base32 인코딩)
     */
    public String generateSecret() {
        SecureRandom random = new SecureRandom();
        byte[] secretBytes = new byte[SECRET_LENGTH];
        random.nextBytes(secretBytes);
        return Base32.encode(secretBytes);
    }

    /**
     * 현재 시간 기반 TOTP 코드 생성
     */
    public String generateCode(String secret) {
        long timeStep = System.currentTimeMillis() / 1000 / TIME_STEP_SECONDS;
        return generateCode(secret, timeStep);
    }

    /**
     * 특정 시간 스텝에 대한 TOTP 코드 생성
     */
    public String generateCode(String secret, long timeStep) {
        try {
            byte[] secretBytes = Base32.decode(secret);
            byte[] timeBytes = ByteBuffer.allocate(8).putLong(timeStep).array();

            Mac mac = Mac.getInstance(HMAC_SHA1_ALGORITHM);
            SecretKeySpec keySpec = new SecretKeySpec(secretBytes, HMAC_SHA1_ALGORITHM);
            mac.init(keySpec);
            byte[] hash = mac.doFinal(timeBytes);

            // Dynamic Truncation (RFC 4226)
            int offset = hash[hash.length - 1] & 0x0F;
            int binary = ((hash[offset] & 0x7F) << 24) |
                    ((hash[offset + 1] & 0xFF) << 16) |
                    ((hash[offset + 2] & 0xFF) << 8) |
                    (hash[offset + 3] & 0xFF);

            int otp = binary % (int) Math.pow(10, CODE_DIGITS);
            return String.format("%0" + CODE_DIGITS + "d", otp);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("TOTP 코드 생성 실패", e);
            throw new IllegalStateException("TOTP 코드 생성에 실패했습니다.", e);
        }
    }

    /**
     * TOTP 코드 검증 (현재 시간 ±1 스텝 허용)
     */
    public boolean verifyCode(String secret, String code) {
        long currentTimeStep = System.currentTimeMillis() / 1000 / TIME_STEP_SECONDS;
        
        // 현재 시간, 이전 시간, 다음 시간 모두 확인 (시간 동기화 오차 허용)
        for (long timeStep = currentTimeStep - 1; timeStep <= currentTimeStep + 1; timeStep++) {
            String expectedCode = generateCode(secret, timeStep);
            if (code.equals(expectedCode)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Base32 인코딩/디코딩 유틸리티 클래스
     */
    private static class Base32 {
        private static final String BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

        public static String encode(byte[] data) {
            StringBuilder result = new StringBuilder();
            int buffer = 0;
            int bitsLeft = 0;

            for (byte b : data) {
                buffer = (buffer << 8) | (b & 0xFF);
                bitsLeft += 8;

                while (bitsLeft >= 5) {
                    int index = (buffer >> (bitsLeft - 5)) & 0x1F;
                    result.append(BASE32_CHARS.charAt(index));
                    bitsLeft -= 5;
                }
            }

            if (bitsLeft > 0) {
                int index = (buffer << (5 - bitsLeft)) & 0x1F;
                result.append(BASE32_CHARS.charAt(index));
            }

            return result.toString();
        }

        public static byte[] decode(String encoded) {
            encoded = encoded.toUpperCase().replaceAll("[^A-Z2-7]", "");
            int buffer = 0;
            int bitsLeft = 0;
            byte[] result = new byte[(encoded.length() * 5) / 8];
            int resultIndex = 0;

            for (char c : encoded.toCharArray()) {
                int value = BASE32_CHARS.indexOf(c);
                if (value < 0) continue;

                buffer = (buffer << 5) | value;
                bitsLeft += 5;

                if (bitsLeft >= 8) {
                    result[resultIndex++] = (byte) ((buffer >> (bitsLeft - 8)) & 0xFF);
                    bitsLeft -= 8;
                }
            }

            return result;
        }
    }
}
