package com.up.demo.controller;

import com.up.demo.entity.Calendar;
import com.up.demo.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calendars")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    // 특정 유저의 캘린더 생성 (POST /api/calendars/1?name=MyCalendar)
    @PostMapping("/{userId}")
    public ResponseEntity<Calendar> createCalendar(
            @PathVariable Long userId,
            @RequestParam String name) {
        Calendar calendar = calendarService.createCalendar(userId, name);
        return ResponseEntity.ok(calendar);
    }

    // 특정 유저의 캘린더 조회 (GET /api/calendars/user/1)
    @GetMapping("/user/{userId}")
    public ResponseEntity<Calendar> getCalendar(@PathVariable Long userId) {
        Calendar calendar = calendarService.getCalendarByUserId(userId);
        return ResponseEntity.ok(calendar);
    }
}