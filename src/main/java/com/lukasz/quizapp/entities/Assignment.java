package com.lukasz.quizapp.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Assignment {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "path_id")
    private Path path;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @OneToMany(
            mappedBy = "assignment",
            cascade = {CascadeType.REMOVE}
    )
    private List<Solve> solves;

    private Date startDate;

    private Date expirationDate;

    private boolean isSynchronous;

    private boolean allowAsynchronousSubmission = false;

    private boolean allowSubmitAfterExpiration = false;
}
