package com.lukasz.quizapp.entities;

import com.lukasz.quizapp.dto.QuestionDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "solves")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Solve {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @ManyToOne
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private Integer correctAnswers;

    private Integer totalAnswers;

    @OneToMany(mappedBy = "solve", cascade = CascadeType.ALL)
    private List<SubmittedAnswer> userAnswers;

    private boolean wasGame;

    @CreationTimestamp
    @Column(updatable = false, nullable = false)
    private Date submittedAt;
}
