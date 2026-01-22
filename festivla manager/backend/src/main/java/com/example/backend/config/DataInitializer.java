package com.example.backend.config;

import com.example.backend.domain.entity.Table;
import com.example.backend.domain.entity.User;
import com.example.backend.domain.enums.TableStatus;
import com.example.backend.domain.enums.UserRole;
import com.example.backend.domain.enums.UserStatus;
import com.example.backend.repository.TableRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(1) // TableInitializer보다 먼저 실행
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TableRepository tableRepository;

    @Override
    public void run(String... args) {
        initAdminUser();
        // 테이블은 TableInitializer에서 처리하므로 여기서는 제외
    }

    /**
     * 관리자 계정 초기화
     */
    private void initAdminUser() {
        // 관리자 계정이 이미 있으면 건너뛰기
        if (userRepository.findByKakaoId("admin").isPresent()) {
            log.info("관리자 계정이 이미 존재합니다.");
            return;
        }

        log.info("관리자 계정 생성 시작...");

        User admin = User.builder()
                .kakaoId("admin")
                .name("관리자")
                .nickname("관리자")
                .phoneNumber("010-0000-0000")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(admin);
        log.info("관리자 계정 생성 완료: 아이디=admin, 비밀번호=1234 (테스트용)");
    }
}
