package com.lukasz.quizapp.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TestTokenRefreshResponse {

    private Long expiresAt;

    private String accessToken;

    public TestTokenRefreshResponse(Long expiresAt, String accessToken) {
        this.expiresAt = expiresAt;
        this.accessToken = accessToken;
    }

}
