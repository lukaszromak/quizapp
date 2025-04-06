package com.lukasz.quizapp.entities;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Entity
@Table(name = "quizzes")
@NamedEntityGraph(
        name = "quiz-entity-graph-questions-categories",
        attributeNodes = {
                @NamedAttributeNode(value = "questions", subgraph = "questions-subgraph"),
                @NamedAttributeNode(value = "creator"),
                @NamedAttributeNode(value = "categories", subgraph = "categories-subgraph")
        },
        subgraphs = {
                @NamedSubgraph(
                        name = "questions-subgraph",
                        attributeNodes = @NamedAttributeNode("answers")
                ),
                @NamedSubgraph(
                        name = "categories-subgraph",
                        attributeNodes = @NamedAttributeNode("quizzes")
                ),
                @NamedSubgraph(
                        name = "creator-subgraph",
                        attributeNodes = @NamedAttributeNode("roles")
                )
        }
)
@NamedEntityGraph(
        name = "quiz-entity-graph-categories",
        attributeNodes = {
                @NamedAttributeNode(value = "creator"),
                @NamedAttributeNode(value = "categories", subgraph = "categories-subgraph")
        },
        subgraphs = {
                @NamedSubgraph(
                        name = "categories-subgraph",
                        attributeNodes = @NamedAttributeNode("quizzes")
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotBlank
    private String title;

    @OneToMany(
            mappedBy = "quiz",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Question> questions;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creator_id")
    private User creator;

    @ManyToMany
    @JoinTable(
            name = "quizzes_categories",
            joinColumns = { @JoinColumn(name = "quiz_id") },
            inverseJoinColumns = { @JoinColumn(name = "quiz_category_id") }
    )
    private Set<QuizCategory> categories;

}
