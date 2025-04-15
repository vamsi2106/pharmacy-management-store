package com.pharmacy.management.controller;

import com.pharmacy.management.model.User;
import com.pharmacy.management.service.UserService;
import com.pharmacy.management.security.JwtUtils;
import com.pharmacy.management.payload.JwtResponse;
import com.pharmacy.management.payload.LoginRequest;
import com.pharmacy.management.payload.MessageResponse;
import com.pharmacy.management.payload.SignupRequest;
import com.pharmacy.management.repository.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        // Get username from the authentication principal
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername();
        
        // Fetch the full user entity from the repository
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        return ResponseEntity.ok(new JwtResponse(
            jwt,
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().toString()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        if (userService.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity
                .badRequest()
                .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User();
        user.setName(signupRequest.getName());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(signupRequest.getPassword());
        user.setContactNumber(signupRequest.getContactNumber());
        user.setAddress(signupRequest.getAddress());
        user.setRole(User.Role.CUSTOMER); // Default role for signup

        userService.createUser(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
} 