package com.lukasz.quizapp.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "quiz_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuizCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "quiz_category_id")
    private Long id;

    private String name;

    @ManyToMany(
            mappedBy = "categories",
            fetch = FetchType.LAZY
    )
    @JsonIgnore
    private Set<Quiz> quizzes;
}
