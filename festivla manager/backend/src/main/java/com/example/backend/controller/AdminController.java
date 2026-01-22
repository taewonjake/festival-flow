package com.example.backend.controller;

import com.example.backend.dto.request.AdminLoginRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.UserLoginResponse;
import com.example.backend.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "관리자", description = "관리자 인증 API")
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @Operation(summary = "관리자 로그인", description = "관리자 로그인 (임시)")
    @PostMapping("/login")
    public ApiResponse<UserLoginResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        UserLoginResponse response = adminService.login(request.getEmail(), request.getPassword());
        return ApiResponse.success("로그인 성공", response);
    }
}
