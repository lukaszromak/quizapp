package com.lukasz.quizapp.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
public class AssignmentDto {

    private Long id;

    private String name;

    private Long pathId;

    private Long quizId;

    private Date startDate;

    private Date expirationDate;

    private boolean isSynchronous;

}
