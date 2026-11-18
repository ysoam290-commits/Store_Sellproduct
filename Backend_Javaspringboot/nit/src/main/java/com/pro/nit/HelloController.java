package com.pro.nit;

import com.pro.nit.DTO.user.UserListResponse;
import com.pro.nit.Entity.User;
import com.pro.nit.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class HelloController {

    private final UserRepository userRepository;

    @GetMapping
    public UserListResponse getAll() {
        List<UserListResponse.UserSummary> users = userRepository.findAll().stream()
                .map(UserListResponse.UserSummary::from)
                .toList();
        return new UserListResponse(users.size(), users);
    }
}
