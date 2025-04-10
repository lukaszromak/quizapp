package com.lukasz.quizapp.controllers;

import com.lukasz.quizapp.dto.*;
import com.lukasz.quizapp.entities.*;
import com.lukasz.quizapp.exception.*;
import com.lukasz.quizapp.exception.Assigment.AssignmentExpiredException;
import com.lukasz.quizapp.exception.Assigment.AsynchronousSubmissionForSynchronousAssignmentException;
import com.lukasz.quizapp.exception.Assigment.TooManySubmissionsException;
import com.lukasz.quizapp.services.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final QuizService quizService;

    private final SolveService solveService;

    private final AuthService authService;

    private final AssignmentService assignmentService;

    private final PathService pathService;

    @Autowired
    public QuizController(QuizService quizService, SolveService solveService, AuthService authService, AssignmentService assignmentService, PathService pathService) {
        this.quizService = quizService;
        this.solveService = solveService;
        this.authService = authService;
        this.assignmentService = assignmentService;
        this.pathService = pathService;
    }

    @PostMapping
    public ResponseEntity<Quiz> addQuiz(@Valid @RequestPart("quiz") QuizDto quizDto, @RequestPart(value = "images") MultipartFile[] images) {
        return ResponseEntity.ok(quizService.save(quizDto, images));
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> getQuizzes(@RequestParam(required = false) String title) {
        QuizSearch quizSearch = new QuizSearch(title);
        List<Quiz> quizzes = quizService.read(quizSearch);
        quizService.nullifyIsValid(quizzes);

        return ResponseEntity.ok(quizzes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteQuiz(@PathVariable Long id) {
        Quiz quiz = quizService.read(id);

        if(!authService.getAuthenticatedUser().getId().equals(quiz.getCreator().getId())) {
            throw new RuntimeException("You cannot delete others quizzes!.");
        }

        quizService.delete(id);

        return ResponseEntity.ok(String.format("Quiz with id %d successfully deleted.", id));
    }

    @PutMapping
    public ResponseEntity<Quiz> updateQuiz(@RequestBody QuizDto quizDto) {
        return quizService.update(quizDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuiz(@PathVariable Long id) {
        Quiz quiz = quizService.read(id);

        if(!authService.isModeratorOrAdmin()) {
            quizService.nullifyIsValid(quiz);
        }

        return ResponseEntity.ok(quiz);
    }

    @PostMapping
    @RequestMapping("/solve/{id}")
    public ResponseEntity<Solve> submitSolution(@PathVariable Long id, @RequestBody QuizDto quizDto, @RequestParam(required = false) Long assignmentId) throws PathNotFoundException {
        User user = authService.getAuthenticatedUser();
        Quiz quiz = quizService.read(id);
        Integer correctAnswers = quizService.countCorrectAnswers(quiz, quizDto);

        List<SubmittedAnswer> submittedAnswers = new ArrayList<>();

        Solve solve = new Solve(null, quiz, null, user, correctAnswers, quiz.getQuestions().size(), submittedAnswers, false, null);

        for(QuestionDto questionDto: quizDto.getQuestions()) {
            Question question = findQuestionById(quiz, questionDto.getId());

            if(question == null) {
                throw new QuestionNotFoundException(String.format("Quiz with id {%d} doesn't contain question with id {%d}", quiz.getId(), questionDto.getId()));
            }

            Answer answer = findSubmittedAnswer(question.getAnswers().stream().toList(), questionDto.getAnswers());

            submittedAnswers.add(
                    new SubmittedAnswer(
                            null,
                            solve,
                            question,
                            answer
                    )
            );
        }

        if(assignmentId != null) {
            Assignment assignment = assignmentService.read(assignmentId, false);
            Path path = pathService.read(assignment.getPath().getId());

            if(path.getStudents().stream().noneMatch(user1 -> Objects.equals(user1.getId(), user.getId()))) {
                throw new StudentNotInClassroom(String.format("Student with id {%d} is not in that classroom.", path.getId()));
            }

            if(assignment.getExpirationDate() != null && !assignment.isAllowSubmitAfterExpiration() && new Date().after(assignment.getExpirationDate())) {
                throw new AssignmentExpiredException("Assignment already expired.");
            }

            if(assignment.getSolves().stream().filter(s -> Objects.equals(s.getUser().getId(), user.getId())).count() > 0) {
                throw new TooManySubmissionsException("You sent too many submissions to this assignment.");
            }

            if(assignment.isSynchronous() && !assignment.isAllowAsynchronousSubmission()) {
                throw new AsynchronousSubmissionForSynchronousAssignmentException("This assignment is not allowed to be solved asynchronously.");
            }

            solve.setAssignment(assignment);
            assignment.getSolves().add(solve);

            assignmentService.save(assignment);
        }

        solveService.save(solve);

        return ResponseEntity.ok(solve);
    }

    private Question findQuestionById(Quiz quiz, Long id) {
        for(Question question : quiz.getQuestions()) {
            if(Objects.equals(question.getId(), id)) return question;
        }

        return null;
    }

    private Answer findSubmittedAnswer(List<Answer> answers, List<AnswerDto> submittedAnswers) {
        Long submittedAnswerId = null;

        for(AnswerDto answerDto : submittedAnswers) {
            if(answerDto.getIsValid()) {
                submittedAnswerId = answerDto.getId();
            }
        }

        if(submittedAnswerId == null) return null;

        for(Answer answer : answers) {
            if(Objects.equals(answer.getId(), submittedAnswerId)) return answer;
        }

        throw new AnswerNotFoundException("Question doesn't contain selected answer.");
    }
}
