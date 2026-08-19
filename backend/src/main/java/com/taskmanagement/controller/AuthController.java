package com.taskmanagement.controller;

import com.taskmanagement.dto.AuthRequest;
import com.taskmanagement.dto.AuthResponse;
import com.taskmanagement.dto.LoginRequest;
import com.taskmanagement.model.User;
import com.taskmanagement.repository.UserRepository;
import com.taskmanagement.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String jwtToken = jwtService.generateToken(userDetails);
        
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        
        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .name(user.getName())
                .build());
    }
    // ✅ BACKEND HEALTH CHECK ENDPOINT - FOR MOCK/FALLBACK DETECTION
    @GetMapping("/check")
    public ResponseEntity<?> check() {
        return ResponseEntity.ok("Backend is running!");
    }

}