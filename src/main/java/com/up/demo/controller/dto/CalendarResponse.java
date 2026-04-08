package com.up.demo.controller.dto;

import com.up.demo.entity.Calendar;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CalendarResponse {
    private Long id;
    private String calendarName;
    private Long userId;

    public static CalendarResponse from(Calendar calendar) {
        return new CalendarResponse(
                calendar.getId(),
                calendar.getCalendarName(),
                calendar.getUser() == null ? null : calendar.getUser().getId()
        );
    }
}
