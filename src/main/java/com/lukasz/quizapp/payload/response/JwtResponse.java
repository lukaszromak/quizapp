package com.lukasz.quizapp.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class JwtResponse {
    private Long id;

    private Long expiresAt;

    private String username;

    private String email;

    private List<String> roles;

    public JwtResponse(Long id, Long expiresAt, String username, String email, List<String> roles) {
        this.id = id;
        this.expiresAt = expiresAt;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }
}
