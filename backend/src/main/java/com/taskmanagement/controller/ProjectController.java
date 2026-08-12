package com.taskmanagement.controller;

import com.taskmanagement.dto.ProjectDTO;
import com.taskmanagement.model.Project;
import com.taskmanagement.model.User;
import com.taskmanagement.repository.UserRepository;
import com.taskmanagement.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    
    private final ProjectService projectService;
    private final UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getUserProjects(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(projectService.getUserProjects(user.getId()));
    }
    
    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(
            @Valid @RequestBody Project project,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(projectService.createProject(project, user));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody Project project,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(projectService.updateProject(id, project, user));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        projectService.deleteProject(id, user);
        return ResponseEntity.ok().build();
    }
}