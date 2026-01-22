package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminLoginRequest {

    @NotBlank(message = "아이디는 필수입니다")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;
}
