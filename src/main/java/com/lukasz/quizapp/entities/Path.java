package com.lukasz.quizapp.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "paths")
@NamedEntityGraph(
        name = "path-entity-graph",
        attributeNodes = {
                @NamedAttributeNode(value = "students"),
                @NamedAttributeNode(value = "quizzes", subgraph = "quizzes-subgraph"),
                @NamedAttributeNode(value = "assignments", subgraph = "assignments-subgraph")
        },
        subgraphs = {
                @NamedSubgraph(
                        name = "quizzes-subgraph",
                        attributeNodes = @NamedAttributeNode("questions")
                ),
                @NamedSubgraph(
                        name = "assignments-subgraph",
                        attributeNodes = @NamedAttributeNode("solves")
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

    @OneToMany(
            mappedBy = "path"
    )
    private List<Assignment> assignments;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private User teacher;
}
