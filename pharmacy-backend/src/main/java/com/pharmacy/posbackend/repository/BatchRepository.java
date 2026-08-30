package com.pharmacy.posbackend.repository;

import com.pharmacy.posbackend.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BatchRepository extends JpaRepository<Batch, Long> {
    Optional<Batch> findByBatchNumber(String batchNumber);
    List<Batch> findByMedicineId(Long medicineId);
    List<Batch> findByExpiryDateBefore(LocalDate date);
}