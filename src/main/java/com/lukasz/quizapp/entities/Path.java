package com.lukasz.quizapp.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Path {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @OneToMany
    private List<User> students;

    @OneToMany
    @JoinColumn(name = "quiz_id")
    private List<Quiz> quizzes;

    @OneToMany
    private List<User> teachers;
}
