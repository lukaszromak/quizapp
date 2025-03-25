package com.lukasz.quizapp.dto.game;

import com.lukasz.quizapp.entities.SubmittedAnswer;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class GameStats {

    private Long score;

    private List<SubmittedAnswer> submittedAnswerList;
}
