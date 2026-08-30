package com.pharmacy.posbackend.service;

import com.pharmacy.posbackend.dto.BatchRequest;
import com.pharmacy.posbackend.dto.CategoryDTO;
import com.pharmacy.posbackend.dto.MedicineRequest;
import com.pharmacy.posbackend.entity.Batch;
import com.pharmacy.posbackend.entity.Category;
import com.pharmacy.posbackend.entity.Medicine;
import com.pharmacy.posbackend.repository.BatchRepository;
import com.pharmacy.posbackend.repository.CategoryRepository;
import com.pharmacy.posbackend.repository.MedicineRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class InventoryService {

    private final CategoryRepository categoryRepository;
    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;

    public InventoryService(CategoryRepository categoryRepository,
                            MedicineRepository medicineRepository,
                            BatchRepository batchRepository) {
        this.categoryRepository = categoryRepository;
        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
    }

    // --- Category Management ---
    public Category addCategory(CategoryDTO dto) {
        Category category = Category.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
        return categoryRepository.save(category);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // --- Medicine Management ---
    public Medicine addMedicine(MedicineRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Medicine medicine = Medicine.builder()
                .name(request.getName())
                .genericName(request.getGenericName())
                .brand(request.getBrand())
                .dosageForm(request.getDosageForm())
                .strength(request.getStrength())
                .prescriptionRequired(request.isPrescriptionRequired())
                .category(category)
                .build();

        return medicineRepository.save(medicine);
    }

    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    // --- Batch / Stock Management ---
    public Batch addBatch(BatchRequest request) {
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        Batch batch = Batch.builder()
                .batchNumber(request.getBatchNumber())
                .expiryDate(request.getExpiryDate())
                .manufactureDate(request.getManufactureDate())
                .buyingPrice(request.getBuyingPrice())
                .sellingPrice(request.getSellingPrice())
                .quantity(request.getQuantity())
                .medicine(medicine)
                .build();

        return batchRepository.save(batch);
    }

    public List<Batch> getAllBatches() {
        return batchRepository.findAll();
    }

    public List<Batch> getBatchesByMedicine(Long medicineId) {
        return batchRepository.findByMedicineId(medicineId);
    }

    public List<Batch> getExpiredBatches() {
        return batchRepository.findByExpiryDateBefore(LocalDate.now());
    }
}
