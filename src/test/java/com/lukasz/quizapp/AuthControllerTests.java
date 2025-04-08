package com.lukasz.quizapp;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lukasz.quizapp.payload.request.LoginRequest;
import com.lukasz.quizapp.payload.request.SignupRequest;
import com.lukasz.quizapp.payload.response.JwtResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;


    @Test
    void whenValidSignupRequestThenReturnSuccessMessage() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("Aaaa123456");
        signupRequest.setEmail("test1@gmail.com");
        signupRequest.setPassword("test123");

        String signupRequestJson = objectMapper.writeValueAsString(signupRequest);

        this.mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signupRequestJson))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("User registered successfully")));
    }

    @Test
    void givenValidCredentialsWhenValidLoginRequestThenReturnJwtResponse() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("testuser@gmail.com");
        loginRequest.setPassword("123123");

        String loginRequestJson = objectMapper.writeValueAsString(loginRequest);

        MvcResult result = this.mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequestJson))
                .andReturn();

        String content = result.getResponse().getContentAsString();

        JwtResponse jwtResponse = objectMapper.readValue(content, JwtResponse.class);
        assertThat(jwtResponse).hasNoNullFieldsOrProperties();
    }


    @Test
    void givenInvalidCredentialsWhenValidLoginRequestThenStatus401() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("someinvaliduname112");
        loginRequest.setPassword("a123456");

        String loginRequestJson = objectMapper.writeValueAsString(loginRequest);

        this.mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequestJson))
                .andExpect(status().is(401));
    }
}
