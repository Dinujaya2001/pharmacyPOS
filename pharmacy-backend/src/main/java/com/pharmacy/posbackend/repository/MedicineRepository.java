package com.pharmacy.posbackend.repository;

import com.pharmacy.posbackend.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByCategoryId(Long categoryId);
}
