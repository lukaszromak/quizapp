package com.lukasz.quizapp.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lukasz.quizapp.entities.*;
import com.lukasz.quizapp.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.StreamSupport;


@Configuration
public class RepositoriesInitializer {

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    QuizRepository quizRepository;

    @Autowired
    SolveRepository solveRepository;

    @Autowired
    PathRepository pathRepository;

    @Autowired
    QuizCategoryRepository quizCategoryRepository;

    @Autowired
    AssignmentRepository assignmentRepository;

    @Autowired
    ResourceLoader resourceLoader;

    @Autowired
    ObjectMapper objectMapper;

    @Bean
    List<Role> roles() {
        return List.of(
                new Role(ERole.ROLE_USER),
                new Role(ERole.ROLE_MODERATOR),
                new Role(ERole.ROLE_ADMIN)
        );
    }

    @Bean
    List<User> users(PasswordEncoder passwordEncoder) {
        List<User> users = new ArrayList<>();

        User user = new User();
        user.setUsername("testuser");
        user.setEmail("testuser@gmail.com");
        user.setPassword(passwordEncoder.encode("123123"));
        user.setRoles(Set.of(new Role(ERole.ROLE_USER)));
        user.setAccountLocked(false);

        User user1 = new User();
        user1.setUsername("testmod");
        user1.setEmail("testmod@gmail.com");
        user1.setPassword(passwordEncoder.encode("123123"));
        user1.setRoles(Set.of(new Role(ERole.ROLE_MODERATOR)));
        user1.setAccountLocked(false);

        User user2 = new User();
        user2.setUsername("testadmin");
        user2.setEmail("testadmin@gmail.com");
        user2.setPassword(passwordEncoder.encode("123123"));
        user2.setRoles(Set.of(new Role(ERole.ROLE_ADMIN)));
        user2.setAccountLocked(false);

        users.add(user);
        users.add(user1);
        users.add(user2);

        for(int i = 0; i < 110; i++) {
            User user3 = new User();
            user3.setUsername(String.format("test%d", i + 1));
            user3.setEmail(String.format("test%d@testmail.com", i + 1));
            user3.setPassword(passwordEncoder.encode("123123"));
            user3.setRoles(Set.of(new Role(ERole.ROLE_USER)));
            user3.setAccountLocked(false);
            users.add(user3);
        }

        return users;
    }

    @Bean
    List<QuizCategory> categories() {
        List<QuizCategory> categories = new ArrayList<>();
        categories.add(new QuizCategory(null, "History", null));
        categories.add(new QuizCategory(null, "Computer Science", null));
        categories.add(new QuizCategory(null, "Math", null));
        categories.add(new QuizCategory(null, "Biology", null));
        categories.add(new QuizCategory(null, "Chemistry", null));
        categories.add(new QuizCategory(null, "Gym", null));
        categories.add(new QuizCategory(null, "Football", null));
        categories.add(new QuizCategory(null, "Basketball", null));
        categories.add(new QuizCategory(null, "Finance", null));
        categories.add(new QuizCategory(null, "Accounting", null));

        return categories;
    }

    @Bean
    List<Quiz> quizzes() throws IOException {
        List<Quiz> quizzes = new ArrayList<>();
        Quiz quiz = new Quiz();
        quiz.setTitle("Basic History");

        List<Question> questions = new ArrayList<>();

        // quiz 1, question 1
        Set<Answer> answersQ1Q1 = new HashSet<>();
        Question question1Q1 = new Question(null, "When the Battle of Grundwald took place?", quiz, answersQ1Q1, 0, null);
        answersQ1Q1.add(new Answer(null, "1410", question1Q1, true));
        answersQ1Q1.add(new Answer(null, "1510", question1Q1, false));
        answersQ1Q1.add(new Answer(null, "966", question1Q1, false));
        answersQ1Q1.add(new Answer(null, "1939", question1Q1, false));

        // quiz 1, question2
        Set<Answer> answersQ1Q2 = new HashSet<>();
        Question question2Q1 = new Question(null, "When the Middle Ages ended?", quiz, answersQ1Q2, 0, null);
        answersQ1Q2.add(new Answer(null, "1492", question2Q1, true));
        answersQ1Q2.add(new Answer(null, "1453", question2Q1, false));
        answersQ1Q2.add(new Answer(null, "1517", question2Q1, false));
        answersQ1Q2.add(new Answer(null, "1485", question2Q1, false));

        // quiz 1, question3
        Set<Answer> answersQ1Q3 = new HashSet<>();
        Question question3Q1 = new Question(null, "When the Second World War ended?", quiz, answersQ1Q3, 0, null);
        answersQ1Q3.add(new Answer(null, "1943", question3Q1, false));
        answersQ1Q3.add(new Answer(null, "1944", question3Q1, false));
        answersQ1Q3.add(new Answer(null, "1945", question3Q1, true));
        answersQ1Q3.add(new Answer(null, "1946", question3Q1, false));

        // add questions to quiz
        questions.add(question1Q1);
        questions.add(question2Q1);
        questions.add(question3Q1);
        quiz.setQuestions(questions);

        Resource resource = resourceLoader.getResource("classpath:quizzes.json");
        List<Quiz> quizzesFromFile = objectMapper.readValue(resource.getInputStream(), objectMapper.getTypeFactory().constructCollectionType(List.class, Quiz.class));
        for(Quiz quiz1: quizzesFromFile) {
            for(Question question: quiz1.getQuestions()) {
                question.setQuiz(quiz1);
                for(Answer answer: question.getAnswers()) {
                    answer.setQuestion(question);
                }
            }
            quizzes.add(quiz1);
        }

        quizzes.add(quiz);

        return quizzes;
    }

    @Bean
    List<Path> paths() {
        List<Path> paths = new ArrayList<>();

        for(int i = 0; i < 3; i++)
        {
            paths.add(new Path(null, String.format("Classroom %d", i + 1), null, null,null, null));
        }

        return paths;
    }

    @Bean
    @Transactional
    InitializingBean init(List<User> users, List<Role> roles, List<Quiz> quizzes, List<QuizCategory> categories, List<Path> paths) {
        return () -> {
            if(roleRepository.findAll().isEmpty()) {
                roleRepository.saveAll(roles);
            }
            if(userRepository.findAll().isEmpty()) {
                users.get(0).setRoles(Set.of(roles.get(0)));
                users.get(1).setRoles(Set.of(roles.get(1)));
                users.get(2).setRoles(Set.of(roles.get(2)));
                for(int i = 3; i < users.size(); i++) {
                    users.get(i).setRoles(Set.of(roles.get(0)));
                }
                userRepository.saveAll(users);
            }
            if(quizCategoryRepository.findAll().isEmpty()) {
                quizCategoryRepository.saveAll(categories);
            }
            if(quizRepository.findAll().isEmpty()) {
                quizzes.get(0).setCategories(new HashSet<>(Arrays.asList(categories.get(0))));
                quizzes.get(0).setCreator(users.get(0));
                quizRepository.saveAll(quizzes);
            }
            if(solveRepository.findAll().isEmpty()) {
                Random random = new Random();
                List<Solve> solves = new ArrayList<>();
                User user = users.get(0);

                for(int i = 0; i < 10; i++) {
                    Solve solve = new Solve();
                    solve.setUser(user);
                    solve.setQuiz(quizzes.get(1));
                    Quiz quiz = quizzes.get(random.nextInt(quizzes.size()));
                    if(random.nextBoolean()) {
                        solve.setWasGame(true);
                        solve.setTotalAnswers(quiz.getQuestions().size() * 10000);
                        solve.setCorrectAnswers(random.nextInt(quiz.getQuestions().size() * 10000));
                    } else {
                        solve.setWasGame(false);
                        solve.setTotalAnswers(quiz.getQuestions().size());
                        solve.setCorrectAnswers(random.nextInt(quiz.getQuestions().size()));
                    }
                    solves.add(solve);
                }

                solveRepository.saveAll(solves);
            }
            if(!pathRepository.findAll().iterator().hasNext()) {
                List<Path> pathList = StreamSupport.stream(pathRepository.saveAll(paths).spliterator(), false).toList();
                List<Quiz> qzs = quizRepository.findAll();

                for(int i = 0; i < 3; i++)
                {
                    pathList.get(i).setQuizzes(qzs);
                    pathList.get(i).setStudents(users.subList(3, 10));
                    pathList.get(i).setTeacher(users.get(1));
                }

                pathRepository.saveAll(pathList);
            }
            if(assignmentRepository.findAll().isEmpty()) {
                Path path = pathRepository.findById(1L).get();
                Random random = new Random();
                List<Solve> solves;
                List<Assignment> assignments = new ArrayList<>();
                LocalDate nowMinus5Days = LocalDate.now().minusDays(5);
                int i = 0;

                for(Quiz quiz : path.getQuizzes()) {
                    assignments.add(new Assignment(
                            null,
                            "Test",
                            path,
                            quiz,
                            null,
                            Date.from(nowMinus5Days.plusDays(i).atStartOfDay(ZoneId.systemDefault()).toInstant()),
                            Date.from(nowMinus5Days.plusDays(i).atTime(LocalTime.ofSecondOfDay(3600)).atZone(ZoneId.systemDefault()).toInstant()),
                            true,
                            false,
                            false
                    ));
                    i++;
                }

                assignments = assignmentRepository.saveAll(assignments);

                for(Assignment assignment : assignments) {
                    solves = new ArrayList<>();
                    Quiz q = quizRepository.findById(assignment.getQuiz().getId()).get();
                    for(User user: path.getStudents()) {
                        Solve solve = new Solve();
                        solve.setUser(user);
                        solve.setQuiz(q);
                        if(random.nextBoolean()) {
                            solve.setWasGame(true);
                            solve.setTotalAnswers(q.getQuestions().size() * 10000);
                            solve.setCorrectAnswers(random.nextInt(q.getQuestions().size() * 10000));
                        } else {
                            solve.setWasGame(false);
                            solve.setTotalAnswers(q.getQuestions().size());
                            solve.setCorrectAnswers(random.nextInt(q.getQuestions().size()));
                        }
                        solves.add(solve);
                        solve.setAssignment(assignment);
                    }

                    List<Solve> savedSolves = solveRepository.saveAll(solves);
                    assignment.setSolves(savedSolves);
                }

                assignmentRepository.saveAll(assignments);
            }
        };
    }
}
