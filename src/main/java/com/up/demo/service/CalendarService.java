package com.up.demo.service;

import com.up.demo.entity.Calendar;
import com.up.demo.entity.User;
import com.up.demo.repository.CalendarRepository;
import com.up.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarRepository calendarRepository;
    private final UserRepository userRepository;

    // 특정 유저에게 캘린더 생성/연결하기
    @Transactional
    public Calendar createCalendar(Long userId, String calendarName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        Calendar calendar = new Calendar();
        calendar.setCalendarName(calendarName);
        calendar.setUser(user); // 유저와 1:1 연결

        return calendarRepository.save(calendar);
    }

    // 유저 ID로 캘린더 정보 가져오기
    @Transactional(readOnly = true)
    public Calendar getCalendarByUserId(Long userId) {
        return calendarRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("해당 유저의 캘린더가 존재하지 않습니다."));
    }
}