package com.lukasz.quizapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class StudentNotInClassroom extends RuntimeException {

    public StudentNotInClassroom(String message) {
        super(message);
    }

}
