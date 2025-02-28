package com.lukasz.quizapp.controllers;

import com.lukasz.quizapp.entities.ERole;
import com.lukasz.quizapp.entities.RefreshToken;
import com.lukasz.quizapp.entities.Role;
import com.lukasz.quizapp.entities.User;
import com.lukasz.quizapp.exception.InvalidPasswordException;
import com.lukasz.quizapp.exception.TokenRefreshException;
import com.lukasz.quizapp.payload.request.ChangePasswordRequest;
import com.lukasz.quizapp.payload.request.LoginRequest;
import com.lukasz.quizapp.payload.request.SignupRequest;
import com.lukasz.quizapp.payload.request.TokenRefreshRequest;
import com.lukasz.quizapp.payload.response.*;
import com.lukasz.quizapp.repositories.RoleRepository;
import com.lukasz.quizapp.repositories.UserRepository;
import com.lukasz.quizapp.security.jwt.JwtUtils;
import com.lukasz.quizapp.security.services.UserDetailsImpl;
import com.lukasz.quizapp.services.AuthService;
import com.lukasz.quizapp.services.RefreshTokenService;
import com.lukasz.quizapp.services.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.WebUtils;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;

    private final UserService userService;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtUtils jwtUtils;

    private final RefreshTokenService refreshTokenService;

    private final AuthService authService;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager,
                          UserService userService,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtils jwtUtils,
                          RefreshTokenService refreshTokenService,
                          AuthService authService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
        this.authService = authService;
    }

    @PostMapping("/signin")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse httpServletResponse) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String jwt = jwtUtils.generateJwtToken(userDetails);

        refreshTokenService.deleteByUserId(userDetails.getId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .toList();

        Cookie accessTokenCookie = new Cookie("ACCESS_TOKEN", jwt);
        accessTokenCookie.setSecure(true);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setPath("/");
        httpServletResponse.addCookie(accessTokenCookie);

        Cookie refreshTokenCookie = new Cookie("REFRESH_TOKEN", refreshToken.getToken());
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setPath("/");
        httpServletResponse.addCookie(refreshTokenCookie);

        return ResponseEntity.ok(new JwtResponse(
                userDetails.getId(),
                jwtUtils.getExpirationTimeFromJwtToken(jwt),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles
        ));
    }

    @PostMapping("/testsignin")
    @ConditionalOnProperty(name = "testsignin.controller.enabled", havingValue = "true", matchIfMissing = false)
    public ResponseEntity<TestJwtResponse> testAuthenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse httpServletResponse) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String jwt = jwtUtils.generateJwtToken(userDetails);

        refreshTokenService.deleteByUserId(userDetails.getId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .toList();

        return ResponseEntity.ok(new TestJwtResponse(
                userDetails.getId(),
                jwtUtils.getExpirationTimeFromJwtToken(jwt),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles,
                jwt,
                refreshToken.getToken()
        ));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        if(userService.existsByUsername(signupRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("User with this name already exists."));
        }

        if(userService.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("User with that email already exists."));
        }

        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        user.setRoles(Set.of(userRole));
        user.setAccountLocked(false);
        userService.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully"));
    }

    @PostMapping("/signout")
    public ResponseEntity<?> signOut(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) {
        Cookie accessTokenCookie = null;
        Cookie refreshTokenCookie = null;

        if(httpServletRequest.getCookies() == null) {
            return ResponseEntity.badRequest().body("User not logged in");
        }

        for(Cookie c: httpServletRequest.getCookies()) {
            if(c.getName().equals("ACCESS_TOKEN")) {
                accessTokenCookie = c;
            }
            if(c.getName().equals("REFRESH_TOKEN")) {
                refreshTokenCookie = c;
            }
        }

        if(accessTokenCookie != null) {
            accessTokenCookie.setMaxAge(0);
            accessTokenCookie.setPath("/");
            httpServletResponse.addCookie(accessTokenCookie);
        }

        if(refreshTokenCookie != null) {
            refreshTokenCookie.setMaxAge(0);
            refreshTokenCookie.setPath("/");
            httpServletResponse.addCookie(refreshTokenCookie);
        }

        return ResponseEntity.ok(new MessageResponse("User logged out successfully"));
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshtoken(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) {
        Cookie cookie = WebUtils.getCookie(httpServletRequest, "REFRESH_TOKEN");

        if(cookie == null) {
            return ResponseEntity.badRequest().body("No REFRESH_TOKEN cookie.");
        }

        String requestRefreshToken = cookie.getValue();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateTokenFromEmail(user.getEmail());

                    Cookie accessTokenCookie = new Cookie("ACCESS_TOKEN", token);
                    accessTokenCookie.setSecure(true);
                    accessTokenCookie.setHttpOnly(true);
                    accessTokenCookie.setPath("/");
                    httpServletResponse.addCookie(accessTokenCookie);

                    return ResponseEntity.ok(new TokenRefreshResponse(jwtUtils.getExpirationTimeFromJwtToken(token)));
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken,
                        "Refresh token is not in database!"));
    }

    @PostMapping("/changePassword")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest, HttpServletResponse httpServletResponse) {
        RefreshToken refreshToken = authService.changePassword(changePasswordRequest.getOldPassword(), changePasswordRequest.getNewPassword());

        Cookie refreshTokenCookie = new Cookie("REFRESH_TOKEN", refreshToken.getToken());
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setPath("/");
        httpServletResponse.addCookie(refreshTokenCookie);

        return ResponseEntity.ok("Password changed.");
    }

    @PostMapping("/testrefreshtoken")
    @ConditionalOnProperty(name = "testsignin.controller.enabled", havingValue = "true", matchIfMissing = false)
    public ResponseEntity<?> testRefreshToken(HttpServletRequest httpServletRequest) {
        Cookie cookie = WebUtils.getCookie(httpServletRequest, "REFRESH_TOKEN");

        if(cookie == null) {
            return ResponseEntity.badRequest().body("No REFRESH_TOKEN cookie.");
        }

        String requestRefreshToken = cookie.getValue();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateTokenFromEmail(user.getEmail());

                    return ResponseEntity.ok(new TestTokenRefreshResponse(jwtUtils.getExpirationTimeFromJwtToken(token), token));
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken,
                        "Refresh token is not in database!"));
    }

}
