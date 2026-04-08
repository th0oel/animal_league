package com.up.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "exams")
public class Exam extends BaseEntity {

    private String subject;
    private LocalDate examDate;

    // FK: user_id (N:1 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}