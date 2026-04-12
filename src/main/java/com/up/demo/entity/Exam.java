package com.up.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "exams")
public class Exam extends BaseEntity {

    private String subject;
    private LocalDate examDate;

    @Column(nullable = false)
    private Integer difficulty;

    @Column(nullable = false)
    private Integer understanding;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}