package com.lukasz.quizapp.dto;

import com.lukasz.quizapp.entities.Quiz;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class QuestionDto {

    private Long id;

    @NotBlank
    private String question;

    private Quiz quiz;

    private List<AnswerDto> answers;

    private Integer timeToAnswer;
}
