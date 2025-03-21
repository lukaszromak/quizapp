package com.lukasz.quizapp.services;

import com.lukasz.quizapp.entities.RefreshToken;
import com.lukasz.quizapp.entities.User;
import com.lukasz.quizapp.exception.InvalidPasswordException;
import com.lukasz.quizapp.repositories.UserRepository;
import com.lukasz.quizapp.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    @Autowired
    public AuthService(UserService userService, PasswordEncoder passwordEncoder, RefreshTokenService refreshTokenService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
    }

    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        UserDetailsImpl userDetails;

        if(principal instanceof UserDetailsImpl) {
            userDetails = (UserDetailsImpl) principal;
        } else {
            System.out.println(authentication.getClass());
            throw new RuntimeException("User not authenticated.");
        }

        return userService.read(userDetails.getId());
    }

    public boolean isModeratorOrAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        return authentication.getAuthorities().stream().anyMatch(r -> r.getAuthority().equals("ROLE_MODERATOR") || r.getAuthority().equals("ROLE_ADMIN"));
    }

    public boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        return authentication.getAuthorities().stream().anyMatch(r -> r.getAuthority().equals("ROLE_ADMIN"));
    }

    public boolean isModerator() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        return authentication.getAuthorities().stream().anyMatch(r -> r.getAuthority().equals("ROLE_MODERATOR"));
    }

    public RefreshToken changePassword(String oldPassword, String newPassword) {
        User user = getAuthenticatedUser();

        if(passwordEncoder.matches(oldPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(newPassword));
        } else {
            throw new InvalidPasswordException("Invalid old password.");
        }

        userService.save(user);
        refreshTokenService.deleteByUserId(user.getId());
        return refreshTokenService.createRefreshToken(user.getId());
    }
}
