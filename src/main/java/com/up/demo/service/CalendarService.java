package com.up.demo.service;

import com.up.demo.entity.Calendar;
import com.up.demo.entity.User;
import com.up.demo.repository.CalendarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarRepository calendarRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public Calendar createCalendar(String calendarName) {
        if (calendarName == null || calendarName.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "calendarName은 필수입니다.");
        }

        User user = currentUserService.getCurrentUser();
        Long userId = user.getId();

        if (calendarRepository.findByUserId(userId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "해당 유저의 캘린더가 이미 존재합니다.");
        }

        Calendar calendar = new Calendar();
        calendar.setCalendarName(calendarName.trim());
        calendar.setUser(user); // 유저와 1:1 연결

        return calendarRepository.save(calendar);
    }

    @Transactional(readOnly = true)
    public Calendar getMyCalendar() {
        Long userId = currentUserService.getCurrentUserId();

        return calendarRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "해당 유저의 캘린더가 존재하지 않습니다."));
    }
}