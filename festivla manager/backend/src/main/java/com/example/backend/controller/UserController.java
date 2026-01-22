package com.example.backend.controller;

import com.example.backend.dto.request.UserLoginRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.UserLoginResponse;
import com.example.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "사용자", description = "사용자 인증 API")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "임시 로그인", description = "닉네임을 기반으로 임시 로그인/회원가입 처리")
    @PostMapping("/login")
    public ApiResponse<UserLoginResponse> login(@Valid @RequestBody UserLoginRequest request) {
        UserLoginResponse response = userService.login(request);
        return ApiResponse.success("로그인 성공", response);
    }
}
