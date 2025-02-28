package com.lukasz.quizapp.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AnswerDto {

    public Long id;

    @NotBlank
    private String content;

    private Boolean isValid;

}
