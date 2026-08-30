package com.pharmacy.posbackend.repository;

import com.pharmacy.posbackend.entity.Prescription;
import com.pharmacy.posbackend.entity.PrescriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByCustomerId(Long customerId);
    List<Prescription> findByStatus(PrescriptionStatus status);
}
