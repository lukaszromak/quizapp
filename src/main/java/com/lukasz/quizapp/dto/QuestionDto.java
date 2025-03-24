package com.lukasz.quizapp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class QuestionDto {

    private Long id;

    @NotBlank
    private String question;

    private List<AnswerDto> answers;

    private Integer timeToAnswer;
}
