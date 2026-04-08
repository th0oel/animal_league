package com.up.demo.controller;

import com.up.demo.controller.dto.ApiResponse;
import com.up.demo.controller.dto.CalendarResponse;
import com.up.demo.controller.dto.CreateCalendarRequest;
import com.up.demo.entity.Calendar;
import com.up.demo.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/calendars")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @PostMapping
    public ResponseEntity<ApiResponse<CalendarResponse>> createCalendar(
            @RequestBody CreateCalendarRequest request) {
        Calendar calendar = calendarService.createCalendar(request.getCalendarName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(HttpStatus.CREATED.value(), "캘린더가 생성되었습니다.", CalendarResponse.from(calendar)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CalendarResponse>> getCalendar() {
        Calendar calendar = calendarService.getMyCalendar();
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK.value(), "캘린더 조회 성공", CalendarResponse.from(calendar)));
    }
}