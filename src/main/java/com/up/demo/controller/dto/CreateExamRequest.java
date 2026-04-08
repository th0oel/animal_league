package com.up.demo.controller.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class CreateExamRequest {
    private String subject;
    private LocalDate examDate;
    private Integer difficulty;
    private Integer understanding;
}
