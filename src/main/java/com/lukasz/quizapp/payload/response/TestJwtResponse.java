package com.lukasz.quizapp.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TestJwtResponse {
    private Long id;

    private Long expiresAt;

    private String username;

    private String email;

    private List<String> roles;

    private String accessToken;

    private String refreshToken;

    public TestJwtResponse(Long id, Long expiresAt, String username, String email, List<String> roles, String accessToken, String refreshToken) {
        this.id = id;
        this.expiresAt = expiresAt;
        this.username = username;
        this.email = email;
        this.roles = roles;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
