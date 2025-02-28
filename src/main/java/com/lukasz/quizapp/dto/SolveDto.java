package com.lukasz.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SolveDto {

    private Long id;

    private QuizDto quiz;

    private Long userId;

    private Integer correctAnswers;

    private Integer totalAnswers;

    private boolean wasGame;

}
