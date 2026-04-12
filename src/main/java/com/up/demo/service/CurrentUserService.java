package com.up.demo.service;

import com.up.demo.entity.User;
import com.up.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("인증이 필요합니다.");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Number number) {
            return userRepository.findById(number.longValue())
                    .orElseThrow(() -> new SecurityException("사용자를 찾을 수 없습니다."));
        }

        if (principal instanceof String principalValue) {
            try {
                long userId = Long.parseLong(principalValue);
                return userRepository.findById(userId)
                        .orElseThrow(() -> new SecurityException("사용자를 찾을 수 없습니다."));
            } catch (NumberFormatException e) {
                return userRepository.findByEmail(principalValue)
                        .orElseThrow(() -> new SecurityException("사용자를 찾을 수 없습니다."));
            }
        }

        throw new SecurityException("인증 정보를 확인할 수 없습니다.");
    }

    @Transactional(readOnly = true)
    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
