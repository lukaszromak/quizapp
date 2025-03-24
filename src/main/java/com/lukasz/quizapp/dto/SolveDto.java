package com.lukasz.quizapp.dto;

import com.lukasz.quizapp.dto.game.UserDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SolveDto {

    private Long id;

    private QuizDto quiz;

    private UserDto user;

    private Integer correctAnswers;

    private Integer totalAnswers;

    private boolean wasGame;

    private Date submittedAt;
}
