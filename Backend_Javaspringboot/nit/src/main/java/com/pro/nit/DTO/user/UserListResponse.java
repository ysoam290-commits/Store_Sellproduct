package com.pro.nit.DTO.user;

import com.pro.nit.Entity.User;
import com.pro.nit.Entity.UserProfile;

import java.time.LocalDateTime;
import java.util.List;

public record UserListResponse(int total, List<UserSummary> list) {
    public record UserSummary(
            Long id,
            String email,
            String phone,
            boolean active,
            LocalDateTime createAt,
            ProfileSummary profile,
            List<String> roles) {

        public static UserSummary from(User user) {
            UserProfile profile = user.getProfile();
            ProfileSummary profileSummary = profile == null ? null : new ProfileSummary(
                    profile.getFirstName(), profile.getLastName(), profile.getImage());
            List<String> roleNames = user.getRoles().stream()
                    .map(role -> role.getName())
                    .toList();
            return new UserSummary(user.getId(), user.getEmail(), user.getPhone(),
                    user.isActive(), user.getCreateAt(), profileSummary, roleNames);
        }
    }

    public record ProfileSummary(String firstName, String lastName, String image) {}
}
