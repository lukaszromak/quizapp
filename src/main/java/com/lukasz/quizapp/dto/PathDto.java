package com.lukasz.quizapp.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.lukasz.quizapp.dto.game.UserDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PathDto {

    private Long id;

    private String name;

    private List<UserDto> students;

    private List<QuizDto> quizzes;

    private List<AssignmentDto> assignments;
}
