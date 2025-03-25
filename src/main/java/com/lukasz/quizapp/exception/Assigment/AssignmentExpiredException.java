package com.lukasz.quizapp.exception.Assigment;

import com.lukasz.quizapp.entities.Assignment;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class AssignmentExpiredException extends RuntimeException {

    public AssignmentExpiredException(String message) {
        super(message);
    }

}
