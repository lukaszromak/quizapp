package com.lukasz.quizapp.dto;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.lukasz.quizapp.entities.QuizCategory;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@AllArgsConstructor
public class QuizDto {

    private Long id;

    @NotBlank
    private String title;

    private List<QuestionDto> questions;

    private Set<QuizCategory> categories;

}
