package com.lukasz.quizapp.dto.game;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class GameEvent {

    @JsonFormat(shape = JsonFormat.Shape.NUMBER)
    private GameEventType eventType;

    private String username;

    private String message;

    public GameEvent(GameEventType eventType) {
        this.eventType = eventType;
    }

    public GameEvent(GameEventType eventType, String username) {
        this.eventType = eventType;
        this.username = username;
    }

    public GameEvent(GameEventType eventType, String username, String message) {
        this.eventType = eventType;
        this.username = username;
        this.message = message;
    }
}
