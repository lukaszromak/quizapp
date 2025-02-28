package com.lukasz.quizapp.dto;


import com.lukasz.quizapp.entities.QuizCategory;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
public class QuizDto {

    @NotBlank
    private String title;

    private List<QuestionDto> questions;

    private Set<QuizCategory> categories;

}
