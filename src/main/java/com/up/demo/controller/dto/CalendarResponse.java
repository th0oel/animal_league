package com.up.demo.controller.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.up.demo.entity.Calendar;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CalendarResponse {
    private Long id;
    private String calendarName;
    private Long userId;
    private List<DailySchedule> schedules;

    public static CalendarResponse from(Calendar calendar) {
        return from(calendar, null);
    }

    public static CalendarResponse from(Calendar calendar, List<DailySchedule> schedules) {
        return new CalendarResponse(
                calendar.getId(),
                calendar.getCalendarName(),
                calendar.getUser() == null ? null : calendar.getUser().getId(),
                schedules
        );
    }
}
