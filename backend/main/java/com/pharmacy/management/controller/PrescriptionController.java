package com.pharmacy.management.controller;

import com.pharmacy.management.model.Prescription;
import com.pharmacy.management.model.User;
import com.pharmacy.management.payload.MessageResponse;
import com.pharmacy.management.repository.UserRepository;
import com.pharmacy.management.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Prescription> uploadPrescription(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description) {
        try {
            User currentUser = getCurrentUser();
            Prescription uploadedPrescription = prescriptionService.uploadPrescription(currentUser.getId(), file, description);
            return new ResponseEntity<>(uploadedPrescription, HttpStatus.CREATED);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Prescription>> getUserPrescriptions() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByUser(currentUser.getId()));
    }

    @GetMapping("/{prescriptionId}")
    @PreAuthorize("@securityService.isPrescriptionOwner(authentication, #prescriptionId) or hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<Prescription> getPrescriptionById(@PathVariable Long prescriptionId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionById(prescriptionId));
    }

    @GetMapping("/{prescriptionId}/download")
    @PreAuthorize("@securityService.isPrescriptionOwner(authentication, #prescriptionId) or hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<Resource> downloadPrescription(@PathVariable Long prescriptionId) {
        try {
            Prescription prescription = prescriptionService.getPrescriptionById(prescriptionId);
            Resource resource = prescriptionService.downloadPrescription(prescriptionId);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(prescription.getFileType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + prescription.getFileName() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{prescriptionId}")
    @PreAuthorize("@securityService.isPrescriptionOwner(authentication, #prescriptionId) or hasRole('ADMIN')")
    public ResponseEntity<?> deletePrescription(@PathVariable Long prescriptionId) {
        try {
            prescriptionService.deletePrescription(prescriptionId);
            return ResponseEntity.ok(new MessageResponse("Prescription deleted successfully!"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error deleting prescription file."));
        }
    }

    @PostMapping("/{prescriptionId}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<Prescription> verifyPrescription(@PathVariable Long prescriptionId) {
        User verifier = getCurrentUser();
        Prescription verifiedPrescription = prescriptionService.verifyPrescription(prescriptionId, verifier.getId());
        return ResponseEntity.ok(verifiedPrescription);
    }

    @PostMapping("/{prescriptionId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<Prescription> rejectPrescription(@PathVariable Long prescriptionId) {
        Prescription rejectedPrescription = prescriptionService.rejectPrescription(prescriptionId);
        return ResponseEntity.ok(rejectedPrescription);
    }

    // Endpoint for admins/pharmacists to get all prescriptions
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<List<Prescription>> getAllPrescriptionsForAdmin() {
        return ResponseEntity.ok(prescriptionService.getAllPrescriptions());
    }
} 