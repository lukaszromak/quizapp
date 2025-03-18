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

    private String name;

    @ManyToMany
    @JoinTable(
            joinColumns = { @JoinColumn(name = "path_id") },
            inverseJoinColumns = { @JoinColumn(name = "user_id") }
    )
    private List<User> students;

    @ManyToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
    @JoinTable(
            joinColumns = { @JoinColumn(name = "path_id") },
            inverseJoinColumns = { @JoinColumn(name = "quiz_id") }
    )
    private List<Quiz> quizzes;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private User teacher;
}
