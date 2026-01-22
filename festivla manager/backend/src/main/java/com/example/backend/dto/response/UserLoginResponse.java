package com.example.backend.dto.response;

import com.example.backend.domain.enums.UserRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserLoginResponse {

    private Long userId;
    private String nickname;
    private UserRole role;
}
