package com.pharmacy.management.repository;

import com.pharmacy.management.model.Prescription;
import com.pharmacy.management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByUser(User user);
    List<Prescription> findByUserOrderByUploadDateDesc(User user);
    List<Prescription> findByVerified(boolean verified);
    List<Prescription> findByRejected(boolean rejected);
} 