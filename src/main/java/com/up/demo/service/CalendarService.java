package com.up.demo.service;

import com.up.demo.controller.dto.CalendarResponse;
import com.up.demo.controller.dto.DailySchedule;
import com.up.demo.controller.dto.ScheduleSubject;
import com.up.demo.entity.Calendar;
import com.up.demo.entity.Exam;
import com.up.demo.entity.User;
import com.up.demo.repository.CalendarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private static final int SCHEDULE_DAYS = 30;

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
    public CalendarResponse getMyCalendar() {
        Long userId = currentUserService.getCurrentUserId();

        Calendar calendar = calendarRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "해당 유저의 캘린더가 존재하지 않습니다."));

        List<DailySchedule> schedules = buildThirtyDaySchedule(calendar.getExams());
        return CalendarResponse.from(calendar, schedules);
    }

    private List<DailySchedule> buildThirtyDaySchedule(List<Exam> exams) {
        LocalDate today = LocalDate.now();

        List<ExamPriority> priorities = exams.stream()
                .filter(exam -> exam.getExamDate() != null)
                .filter(exam -> !exam.getExamDate().isBefore(today))
                .sorted(Comparator
                        .comparingInt((Exam exam) -> calculateScore(exam, today)).reversed()
                        .thenComparing(Exam::getExamDate)
                        .thenComparing(Exam::getSubject, Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(exam -> new ExamPriority(exam, 0))
                .toList();

        if (priorities.isEmpty()) {
            return buildEmptyWindow(today);
        }

        List<ExamPriority> ranked = new ArrayList<>();
        for (int i = 0; i < priorities.size(); i++) {
            ranked.add(new ExamPriority(priorities.get(i).exam(), i + 1));
        }

        LocalDate furthestExamDate = ranked.stream()
                .map(item -> item.exam().getExamDate())
                .max(LocalDate::compareTo)
                .orElse(today);

        LocalDate studyEnd = furthestExamDate.isBefore(today) ? today : furthestExamDate;
        long span = ChronoUnit.DAYS.between(today, studyEnd) + 1;
        int generatedDays = (int) Math.min(span, SCHEDULE_DAYS);

        int pad = SCHEDULE_DAYS - generatedDays;
        int frontPad = pad / 2;
        int backPad = pad - frontPad;

        LocalDate windowStart = today.minusDays(frontPad);
        LocalDate windowEnd = today.plusDays(generatedDays - 1L + backPad);

        Map<LocalDate, List<ScheduleSubject>> subjectsByDate = new HashMap<>();
        for (ExamPriority item : ranked) {
            LocalDate examDate = item.exam().getExamDate();
            LocalDate targetEnd = examDate.isAfter(windowEnd) ? windowEnd : examDate;

            if (targetEnd.isBefore(today)) {
                continue;
            }

            for (LocalDate date = today; !date.isAfter(targetEnd); date = date.plusDays(1)) {
                subjectsByDate
                        .computeIfAbsent(date, ignored -> new ArrayList<>())
                        .add(new ScheduleSubject(item.exam().getSubject(), item.priority()));
            }
        }

        List<DailySchedule> schedules = new ArrayList<>();
        for (LocalDate date = windowStart; !date.isAfter(windowEnd); date = date.plusDays(1)) {
            List<ScheduleSubject> daySubjects = subjectsByDate.getOrDefault(date, new ArrayList<>());
            daySubjects.sort(Comparator.comparingInt(ScheduleSubject::getPriority));
            schedules.add(new DailySchedule(date, daySubjects));
        }

        return schedules;
    }

    private List<DailySchedule> buildEmptyWindow(LocalDate today) {
        List<DailySchedule> schedules = new ArrayList<>();
        for (int i = 0; i < SCHEDULE_DAYS; i++) {
            schedules.add(new DailySchedule(today.plusDays(i), new ArrayList<>()));
        }
        return schedules;
    }

    private int calculateScore(Exam exam, LocalDate today) {
        int difficulty = exam.getDifficulty() == null ? 1 : exam.getDifficulty();
        int understanding = exam.getUnderstanding() == null ? 3 : exam.getUnderstanding();

        long daysLeft = ChronoUnit.DAYS.between(today, exam.getExamDate());
        int urgency = (int) Math.max(1, 31 - daysLeft);

        return difficulty * 4 + (4 - understanding) * 3 + urgency;
    }

    private record ExamPriority(Exam exam, int priority) {
    }
}