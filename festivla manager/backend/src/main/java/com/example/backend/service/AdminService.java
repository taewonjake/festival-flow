package com.example.backend.service;

import com.example.backend.domain.entity.User;
import com.example.backend.domain.enums.UserRole;
import com.example.backend.dto.response.UserLoginResponse;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;

    /**
     * 관리자 로그인 (임시)
     * 아이디와 비밀번호로 로그인 (테스트용)
     */
    @Transactional
    public UserLoginResponse login(String email, String password) {
        // 임시 로그인: email이 "admin"이고 password가 "1234"면 로그인 성공
        if ("admin".equals(email) && "1234".equals(password)) {
            User admin = userRepository.findByKakaoId("admin")
                    .orElseThrow(() -> new IllegalArgumentException("관리자 계정이 없습니다. 서버를 재시작해주세요."));

            return UserLoginResponse.builder()
                    .userId(admin.getId())
                    .nickname(admin.getNickname())
                    .role(admin.getRole())
                    .build();
        }

        throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
}
