package com.pharmacy.posbackend.repository;

import com.pharmacy.posbackend.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;



public interface BatchRepository extends JpaRepository<Batch, Long> {

    Optional<Batch> findByBatchNumber(String batchNumber);
    List<Batch> findByMedicineId(Long medicineId);
    List<Batch> findByExpiryDateBefore(LocalDate date);
    List<Batch> findByExpiryDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT b.medicine.id, b.medicine.name, b.medicine.brand, SUM(b.quantity) " +
           "FROM Batch b GROUP BY b.medicine.id, b.medicine.name, b.medicine.brand " +
           "HAVING SUM(b.quantity) <= :threshold")
    List<Object[]> findLowStockMedicines(@Param("threshold") int threshold);
}