package com.lukasz.quizapp.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class AssignmentDto {

    private Long id;

    private String name;

    private Long pathId;

    private Long quizId;

    private List<SolveDto> solves;

    private Date startDate;

    private Date expirationDate;

    private Boolean isSynchronous;

}
