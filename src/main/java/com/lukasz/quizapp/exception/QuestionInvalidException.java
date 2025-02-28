package com.lukasz.quizapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class QuestionInvalidException extends RuntimeException {

    public QuestionInvalidException(String message) {
        super(message);
    }

}
