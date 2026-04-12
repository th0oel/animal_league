package com.up.demo.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
public class DailySchedule {
    private LocalDate date;
    private List<ScheduleSubject> subjects;
}

