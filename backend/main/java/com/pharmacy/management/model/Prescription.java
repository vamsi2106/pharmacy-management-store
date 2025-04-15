package com.pharmacy.management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "prescriptions")
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    private LocalDateTime uploadDate;

    @NotBlank
    private String fileName;

    private String fileType;

    @NotBlank
    private String filePath; // Path to the stored file

    @Column(columnDefinition = "TEXT")
    private String description;

    private boolean verified = false;

    private boolean rejected = false;

    @ManyToOne
    @JoinColumn(name = "verified_by")
    private User verifiedBy; // User who verified (Admin/Pharmacist)

    private LocalDateTime verificationDate;
} 