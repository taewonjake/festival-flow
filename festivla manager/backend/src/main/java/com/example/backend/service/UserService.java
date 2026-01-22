package com.example.backend.service;

import com.example.backend.domain.entity.User;
import com.example.backend.domain.enums.UserRole;
import com.example.backend.domain.enums.UserStatus;
import com.example.backend.dto.request.UserLoginRequest;
import com.example.backend.dto.response.UserLoginResponse;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    /**
     * 회원가입/로그인 (이름 + 전화번호 기반)
     * 전화번호로 사용자 조회, 없으면 회원가입, 있으면 로그인
     */
    @Transactional
    public UserLoginResponse login(UserLoginRequest request) {
        String name = request.getName();
        String phoneNumber = request.getPhoneNumber();

        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseGet(() -> {
                    // 회원가입
                    User newUser = User.builder()
                            .name(name)
                            .phoneNumber(phoneNumber)
                            .nickname(name) // 이름을 기본 닉네임으로 설정
                            .role(UserRole.STUDENT)
                            .status(UserStatus.ACTIVE)
                            .build();
                    return userRepository.save(newUser);
                });

        // 기존 사용자의 이름이 변경된 경우 업데이트
        if (!user.getName().equals(name)) {
            user.updateName(name);
            if (user.getNickname() == null || user.getNickname().isEmpty()) {
                user.updateNickname(name);
            }
        }

        return UserLoginResponse.builder()
                .userId(user.getId())
                .nickname(user.getNickname() != null ? user.getNickname() : user.getName())
                .role(user.getRole())
                .build();
    }

    /**
     * 사용자 조회
     */
    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + userId));
    }
}
