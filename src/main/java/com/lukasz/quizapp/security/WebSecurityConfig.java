package com.lukasz.quizapp.security;

import com.lukasz.quizapp.configuration.SpaWebFilter;
import com.lukasz.quizapp.security.jwt.AuthEntryPointJwt;
import com.lukasz.quizapp.security.jwt.AuthTokenFilter;
import com.lukasz.quizapp.security.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;


@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {

    public static final String contextPath = "/api";
    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers(contextPath + "/auth/**").permitAll()
                                .requestMatchers(contextPath +"/test/**").permitAll()
                                .requestMatchers(contextPath +"/swagger-ui/**").permitAll()
                                .requestMatchers(contextPath +"/v3/api-docs/**").permitAll()
                                .requestMatchers(contextPath +"/error").permitAll()
                                //FRONTEND TODO
//                                .requestMatchers(HttpMethod.GET, "/quiz/**").permitAll()
//                                .requestMatchers(HttpMethod.POST, "/quiz/**").authenticated()
                                .requestMatchers(contextPath +"/quizCategory/**").permitAll()
                                .requestMatchers(contextPath +"/quiz/images/**").permitAll()
                                .requestMatchers("/", "/index.html", "/static/**",
                                        "/*.ico", "/*.json", "/*.png", "/images/**").permitAll()
                                .anyRequest().authenticated()
                );
        http.cors(Customizer.withDefaults());

        http.authenticationProvider(authenticationProvider());

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        http.addFilterAfter(new SpaWebFilter(), AuthTokenFilter.class);

        return http.build();
    }
}

