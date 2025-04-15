package com.pharmacy.management.service;

import com.pharmacy.management.model.Prescription;
import com.pharmacy.management.model.User;
import com.pharmacy.management.repository.PrescriptionRepository;
import com.pharmacy.management.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir:uploads/prescriptions}")
    private String uploadDir;

    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    public Prescription getPrescriptionById(Long id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Prescription not found with id: " + id));
    }

    public List<Prescription> getPrescriptionsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        return prescriptionRepository.findByUserOrderByUploadDateDesc(user);
    }

    public List<Prescription> getPrescriptionsByVerificationStatus(boolean verified) {
        return prescriptionRepository.findByVerified(verified);
    }

    public List<Prescription> getPrescriptionsByRejectionStatus(boolean rejected) {
        return prescriptionRepository.findByRejected(rejected);
    }

    @Transactional
    public Prescription uploadPrescription(Long userId, MultipartFile file, String description) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate a unique file name
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
        
        // Save the file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Create and save prescription entity
        Prescription prescription = new Prescription();
        prescription.setUser(user);
        prescription.setUploadDate(LocalDateTime.now());
        prescription.setFileName(originalFilename);
        prescription.setFileType(file.getContentType());
        prescription.setFilePath(filePath.toString());
        prescription.setDescription(description);
        prescription.setVerified(false);
        prescription.setRejected(false);
        
        return prescriptionRepository.save(prescription);
    }
    
    public Resource downloadPrescription(Long prescriptionId) throws MalformedURLException {
        Prescription prescription = getPrescriptionById(prescriptionId);
        Path filePath = Paths.get(prescription.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());
        
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("Could not read the file!");
        }
    }
    
    @Transactional
    public void deletePrescription(Long prescriptionId) throws IOException {
        Prescription prescription = getPrescriptionById(prescriptionId);
        
        // Delete file
        Path filePath = Paths.get(prescription.getFilePath());
        Files.deleteIfExists(filePath);
        
        // Delete database entry
        prescriptionRepository.delete(prescription);
    }
    
    @Transactional
    public Prescription verifyPrescription(Long prescriptionId, Long verifierId) {
        Prescription prescription = getPrescriptionById(prescriptionId);
        User verifier = userRepository.findById(verifierId)
                .orElseThrow(() -> new EntityNotFoundException("Verifier not found with id: " + verifierId));
        
        prescription.setVerified(true);
        prescription.setRejected(false);
        prescription.setVerifiedBy(verifier);
        prescription.setVerificationDate(LocalDateTime.now());
        
        return prescriptionRepository.save(prescription);
    }
    
    @Transactional
    public Prescription rejectPrescription(Long prescriptionId) {
        Prescription prescription = getPrescriptionById(prescriptionId);
        
        prescription.setVerified(false);
        prescription.setRejected(true);
        prescription.setVerificationDate(LocalDateTime.now());
        
        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public Prescription linkPrescriptionToOrder(Long prescriptionId, Long orderId) {
        Prescription prescription = getPrescriptionById(prescriptionId);
        
        if (!prescription.isVerified() || prescription.isRejected()) {
            throw new IllegalStateException("Cannot link unapproved prescription to order");
        }
        
        // Link to order - the order reference would be set here
        // This would typically involve fetching the order and setting it
        
        return prescriptionRepository.save(prescription);
    }
} 