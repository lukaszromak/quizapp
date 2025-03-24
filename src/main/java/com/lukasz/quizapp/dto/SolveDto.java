package com.lukasz.quizapp.dto;

import com.lukasz.quizapp.dto.game.UserDto;
import com.lukasz.quizapp.entities.SubmittedAnswer;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;

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

    private List<SubmittedAnswer> userAnswers;

    private boolean wasGame;

    private Date submittedAt;
}
