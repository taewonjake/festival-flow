package com.example.backend.config;

import com.example.backend.domain.entity.Event;
import com.example.backend.domain.entity.User;
import com.example.backend.domain.enums.UserRole;
import com.example.backend.domain.enums.UserStatus;
import com.example.backend.repository.EventRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    @Override
    public void run(String... args) {
        initDefaultEvent();
        initAdminUser();
    }

    private void initDefaultEvent() {
        if (eventRepository.findFirstByOrderByIdAsc().isPresent()) {
            return;
        }

        LocalDate today = LocalDate.now();
        Event event = Event.builder()
                .name("Festival Flow Default Event")
                .startDate(today)
                .endDate(today.plusDays(30))
                .status("ACTIVE")
                .build();

        eventRepository.save(event);
        log.info("Default event created.");
    }

    private void initAdminUser() {
        if (userRepository.findByKakaoId("admin").isPresent()) {
            log.info("Admin account already exists.");
            return;
        }

        User admin = User.builder()
                .kakaoId("admin")
                .name("관리자")
                .nickname("관리자")
                .phoneNumber("010-0000-0000")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(admin);
        log.info("Admin account created.");
    }
}
