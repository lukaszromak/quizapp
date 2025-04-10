package com.lukasz.quizapp.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "submitted_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubmittedAnswer {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    @JsonIgnore
    private Solve solve;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;

    @ManyToOne
    @JoinColumn(name = "answer_id")
    private Answer answer;
}
