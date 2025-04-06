package com.lukasz.quizapp.services;

import com.lukasz.quizapp.dto.QuizSearch;
import com.lukasz.quizapp.entities.*;
import com.lukasz.quizapp.dto.AnswerDto;
import com.lukasz.quizapp.dto.QuestionDto;
import com.lukasz.quizapp.dto.QuizDto;
import com.lukasz.quizapp.exception.QuestionInvalidException;
import com.lukasz.quizapp.exception.QuestionNoAnswersException;
import com.lukasz.quizapp.repositories.QuizRepository;
import com.lukasz.quizapp.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final QuizRepository quizRepository;

    private final AuthService authService;

    private final StorageService storageService;

    private final UserService userService;

    private static final ExampleMatcher QUIZ_SEARCH = ExampleMatcher
            .matchingAny()
            .withMatcher("title", ExampleMatcher.GenericPropertyMatchers.ignoreCase().contains());

    @Autowired
    public QuizService(QuizRepository quizRepository, AuthService authService, StorageService storageService, UserService userService) {
        this.quizRepository = quizRepository;
        this.authService = authService;
        this.storageService = storageService;
        this.userService = userService;
    }

    public Quiz save(QuizDto quizDto, MultipartFile[] images) {
        String[] imagePaths = new String[quizDto.getQuestions().size()];

        for(int i = 0; i < quizDto.getQuestions().size() && i < images.length; i++) {
            imagePaths[i] = storageService.save("/quiz/images", images[i]);
        }

        return quizRepository.save(mapQuizDtoToQuiz(quizDto, imagePaths));
    }

    public List<Quiz> read(QuizSearch quizSearch) {
        Quiz quiz = new Quiz();

        if(quizSearch != null) {
            if(quizSearch.getTitle() != null) {
                System.out.println(quiz.getTitle());
                quiz.setTitle(quizSearch.getTitle());
            }
        }

        List<Quiz> quizzes = quizRepository.findAll(Example.of(quiz, QUIZ_SEARCH));

        return quizzes;
    }

    public Quiz read(Long id) {
        Optional<Quiz> quizOptional = quizRepository.findById(id);

        if(quizOptional.isEmpty()) {
            throw new RuntimeException("Quiz not found.");
        }

        Quiz quiz = quizOptional.get();

        return quiz;
    }

    public List<Quiz> read(User user) {
        return quizRepository.findAllByCreator(user);
    }

    public Integer countCorrectAnswers(Quiz quiz, QuizDto quizDto) {
        Integer correctAnswers = 0;
        int validAnswers = 0;
        boolean correctAnswer = false;
        QuestionDto questionDto = null;
        Long validAnswerId = -1L;

        for(Question question: quiz.getQuestions()) {
            for(Answer answer: question.getAnswers()) {
                if(answer.getIsValid() != null && answer.getIsValid()) {
                    validAnswerId = answer.getId();
                }
            }

            Optional<QuestionDto> optionalQuestionDto = quizDto.getQuestions().stream()
                    .filter(x -> x.getId().equals(question.getId()))
                    .findFirst();

            if(optionalQuestionDto.isPresent()) {
                questionDto = optionalQuestionDto.get();

                for (AnswerDto answerDto : questionDto.getAnswers()) {
                    if (answerDto.getIsValid() != null && answerDto.getIsValid()) {
                        validAnswers++;
                    }
                    if (answerDto.getIsValid() != null && answerDto.getIsValid() && answerDto.getId().equals(validAnswerId)) {
                        correctAnswer = true;
                    }
                }
            }

            if(validAnswers == 1 && correctAnswer) {
                correctAnswers++;
            }

            validAnswers = 0;
            correctAnswer = false;
            validAnswerId = -1L;
        }

        return correctAnswers;
    }

    public void nullifyIsValid(List<Quiz> quizzes) {
        for(Quiz quiz : quizzes) {
            for(Question question: quiz.getQuestions()) {
                for(Answer answer: question.getAnswers()) {
                    answer.setIsValid(null);
                }
            }
        }
    }

    public void nullifyIsValid(Quiz quiz) {
        for(Question question: quiz.getQuestions()) {
            for(Answer answer: question.getAnswers()) {
                answer.setIsValid(null);
            }
        }
    }

    private Quiz mapQuizDtoToQuiz(QuizDto quizDto, String[] imageIds) {
        Quiz quiz = new Quiz();

        quiz.setTitle(quizDto.getTitle());
        quiz.setQuestions(mapQuestionDtosToQuestions(quiz, quizDto.getQuestions()));

        for(int i = 0; i < imageIds.length && i < quiz.getQuestions().size(); i++) {
            if(imageIds[i] == null) continue;
            quiz.getQuestions().get(i).setImagePath(imageIds[i]);
        }

        quiz.setCategories(quizDto.getCategories());
        User creator = userService.read(authService.getAuthenticatedUser().getUsername());
        quiz.setCreator(creator);

        return quiz;
    }

    private List<Question> mapQuestionDtosToQuestions(Quiz quiz, List<QuestionDto> questionDtos) {
        return questionDtos
                .stream()
                .map(questionDto -> mapQuestionDtoToQuestion(quiz, questionDto))
                .collect(Collectors.toList());
    }

    private Question mapQuestionDtoToQuestion(Quiz quiz, QuestionDto questionDto) {
        Question question = new Question();

        if(questionDto.getAnswers() == null || questionDto.getAnswers().isEmpty()) {
            throw new QuestionNoAnswersException();
        }

        if(!hasOneValidAnswer(questionDto)) {
            throw new QuestionInvalidException("Question should have one valid answer.");
        }

        if(questionDto.getTimeToAnswer() == null) {
            question.setTimeToAnswer(0);
        } else {
            question.setTimeToAnswer(questionDto.getTimeToAnswer());
        }

        question.setQuiz(quiz);
        question.setQuestion(questionDto.getQuestion());
        question.setAnswers(mapAnswerDtosToAnswers(question, questionDto.getAnswers()));

        return question;
    }

    private Set<Answer> mapAnswerDtosToAnswers(Question question, List<AnswerDto> answerDtos) {
        return answerDtos
                .stream()
                .map(answerDto -> mapAnswerDtoToAnswer(question, answerDto))
                .collect(Collectors.toSet());
    }

    private Answer mapAnswerDtoToAnswer(Question question, AnswerDto answerDto) {
        Answer answer = new Answer();

        answer.setQuestion(question);
        answer.setContent(answerDto.getContent());
        answer.setIsValid(answerDto.getIsValid());

        return answer;
    }

    public static QuizDto mapQuizToQuizDto(Quiz quiz) {
        QuizDto quizDto = new QuizDto();
        quizDto.setTitle(quiz.getTitle());
        quizDto.setQuestions(new ArrayList<>());
        quizDto.setCategories(quiz.getCategories());

        return quizDto;
    }

    private boolean hasOneValidAnswer(QuestionDto questionDto) {
        int validAnswers = 0;

        for(AnswerDto answerDto: questionDto.getAnswers()) {
            if(answerDto.getIsValid()) {
                validAnswers++;
                if(validAnswers > 1) return false;
            }
        }

        return validAnswers == 1;
    }

    public void delete(Long id) {
        quizRepository.deleteById(id);
    }

    public ResponseEntity<Quiz> update(QuizDto quizDto) {
        return ResponseEntity.ok(quizRepository.save(mapQuizDtoToQuiz(quizDto, null)));
    }
}
