package com.lukasz.quizapp.services;

import com.lukasz.quizapp.dto.game.UserDto;
import com.lukasz.quizapp.entities.Role;
import com.lukasz.quizapp.entities.User;
import com.lukasz.quizapp.repositories.RoleRepository;
import com.lukasz.quizapp.repositories.UserRepository;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    @Autowired
    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public User read(Long id) {
        Optional<User> optionalUser = userRepository.findById(id);

        if(optionalUser.isEmpty()) {
            throw new RuntimeException("User not found.");
        }

        User user = optionalUser.get();

        return user;
    }

    public User read(String username) {
        Optional<User> optionalUser = userRepository.findByUsername(username);

        if(optionalUser.isEmpty()) {
            throw new RuntimeException("User not found.");
        }

        User user = optionalUser.get();

        return user;
    }

    public User readByEmail(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if(optionalUser.isEmpty()) {
            throw new RuntimeException("User not found.");
        }

        User user = optionalUser.get();

        return user;
    }

    public boolean existsById(Long id) {
        return userRepository.existsById(id);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public User update(UserDto userDto) {
        User user = read(userDto.getId());
        Set<Role> roles = new HashSet<>();

        for(Role role: userDto.getRoles()) {
            roles.add(roleRepository.findByName(role.getName()).get());
        }

        user.setRoles(roles);
        user.setAccountLocked(userDto.getAccountLocked());

        return userRepository.save(user);
    }

    public Page<User> readAll(Integer page, String searchText) {
        PageRequest pageable = PageRequest.of(page, 20);

        if(searchText != null && !searchText.equals("")) {
            return userRepository.findAllByUsernameContainingOrEmailContaining(searchText, searchText, pageable);
        }

        return userRepository.findAll(pageable);
    }
}
