package com.lukasz.quizapp.exception.Assigment;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class TooManySubmissionsException extends RuntimeException {

    public TooManySubmissionsException(String message) {
        super(message);
    }

}
