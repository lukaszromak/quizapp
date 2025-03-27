package com.lukasz.quizapp.dto.game;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.lukasz.quizapp.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDto {

    private Long id;

    private String username;

    private Set<Role> roles;

    private Boolean accountLocked;
}
