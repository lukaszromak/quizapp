package com.lukasz.quizapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class QuestionNoAnswersException extends RuntimeException {

    public QuestionNoAnswersException() {
        super("Quiz validation failed, one of questions had no answer");
    }

}
