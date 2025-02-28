package com.lukasz.quizapp.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TokenRefreshResponse {

    private Long expiresAt;
    public TokenRefreshResponse(Long expiresAt) {
        this.expiresAt = expiresAt;
    }

}
