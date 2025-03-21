package com.lukasz.quizapp.services;

import com.lukasz.quizapp.dto.PathDto;
import com.lukasz.quizapp.dto.QuizDto;
import com.lukasz.quizapp.dto.game.UserDto;
import com.lukasz.quizapp.entities.Path;
import com.lukasz.quizapp.entities.Quiz;
import com.lukasz.quizapp.entities.User;
import com.lukasz.quizapp.exception.PathNotFoundException;
import com.lukasz.quizapp.repositories.PathRepository;
import com.lukasz.quizapp.repositories.QuizRepository;
import com.lukasz.quizapp.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static com.lukasz.quizapp.services.AssignmentService.mapAssignmentToAssignmentDto;

@Service
public class PathService {

    private final PathRepository pathRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Autowired
    public PathService(PathRepository pathRepository, QuizRepository quizRepository, UserRepository userRepository, AuthService authService) {
        this.pathRepository = pathRepository;
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    public Path read(Long id) throws PathNotFoundException {
        Optional<Path> pathOptional = pathRepository.findById(id);

        if(pathOptional.isEmpty()) {
            throw new PathNotFoundException(String.format("Path with id %d not found.", id));
        }

        return pathOptional.get();
    }

    public List<Path> read(User user) {
        if(authService.isAdmin()) {
            return StreamSupport.stream(pathRepository.findAll().spliterator(), false).toList();
        } else if (authService.isModerator()) {
            return pathRepository.findAllByTeacher(user);
        }

       return pathRepository.findAllByStudentId(user.getId());
    }

    @Transactional
    public Path save(Path path) {
        List<Long> quizIds = path.getQuizzes().stream()
                .map(Quiz::getId)
                .collect(Collectors.toList());

        List<Quiz> quizList = StreamSupport.stream(quizRepository.findAllById(quizIds).spliterator(), false)
                .collect(Collectors.toList());

        path.setQuizzes(quizList);

        path.setTeacher(authService.getAuthenticatedUser());

        if(path.getStudents() != null) {
            List<User> studentsList = userRepository.findAllById(path.getStudents().stream().map(student -> student.getId()).collect(Collectors.toList()));
            path.setStudents(studentsList);
        }

        return pathRepository.save(path);
    }

    public Path update(PathDto pathDto) {
        Path path = pathRepository.findById(pathDto.getId())
                .orElseThrow(() -> new RuntimeException("Path not found"));

        if (pathDto.getName() != null) {
            path.setName(pathDto.getName());
        }

        if (pathDto.getStudents() != null) {
            List<Long> studentIds = pathDto.getStudents().stream()
                    .map(UserDto::getId)
                    .collect(Collectors.toList());
            List<User> students = userRepository.findAllById(studentIds);
            if (students.size() != studentIds.size()) {
                throw new RuntimeException("Some students not found");
            }
            path.setStudents(students);
        }

        if (pathDto.getQuizzes() != null) {
            List<Long> quizIds = pathDto.getQuizzes().stream()
                    .map(QuizDto::getId)
                    .collect(Collectors.toList());
            List<Quiz> quizzes = StreamSupport.stream(quizRepository.findAllById(quizIds).spliterator(), false)
                    .collect(Collectors.toList());
            if (quizzes.size() != quizIds.size()) {
                throw new RuntimeException("Some quizzes not found");
            }
            path.setQuizzes(quizzes);
        }

        return pathRepository.save(path);
    }

    public static List<PathDto> mapPathsListToPathDtoList(List<Path> pathList) {
        return pathList.stream().map(path -> new PathDto(path.getId(), path.getName(), null, null, null)).collect(Collectors.toList());
    }

    public PathDto mapPathToPathDto(Path path) {
        List<QuizDto> quizzesDto = null;
        List<UserDto> userDtos = null;

        if(authService.isModeratorOrAdmin()) {
            userDtos = path.getStudents().stream().map(student -> new UserDto(student.getId(), student.getUsername())).collect(Collectors.toList());
            quizzesDto = path.getQuizzes().stream().map(quiz -> new QuizDto(quiz.getId(), quiz.getTitle(), null, null)).collect(Collectors.toList());
        }

        return new PathDto(
                path.getId(),
                path.getName(),
                userDtos,
                quizzesDto,
                path.getAssignments().stream().map(assignment -> mapAssignmentToAssignmentDto(assignment)).collect(Collectors.toList()));
    }
}