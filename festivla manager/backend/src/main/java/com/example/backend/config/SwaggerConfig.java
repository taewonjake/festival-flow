package com.example.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Festival Flow API")
                        .description("대학 축제 주점 웨이팅 및 관리 플랫폼 API")
                        .version("v1.0"))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("로컬 서버")
                ));
    }
}
