package com.taskmanagement.service;

import com.taskmanagement.dto.ProjectDTO;
import com.taskmanagement.model.Project;
import com.taskmanagement.model.User;
import com.taskmanagement.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    
    private final ProjectRepository projectRepository;
    private final TaskService taskService;
    
    @Transactional(readOnly = true)
    public List<ProjectDTO> getUserProjects(Long userId) {
        return projectRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ProjectDTO createProject(Project project, User user) {
        project.setUser(user);
        Project saved = projectRepository.save(project);
        return convertToDTO(saved);
    }
    
    @Transactional
    public ProjectDTO updateProject(Long id, Project project, User user) {
        Project existing = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        existing.setName(project.getName());
        existing.setDescription(project.getDescription());
        
        Project updated = projectRepository.save(existing);
        return convertToDTO(updated);
    }
    
    @Transactional
    public void deleteProject(Long id, User user) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (!project.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        projectRepository.delete(project);
    }
    
    private ProjectDTO convertToDTO(Project project) {
        return ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .totalTasks(project.getTotalTasks())
                .completedTasks(project.getCompletedTasks())
                .progress(project.getProgress())
                .status(project.getStatus())
                .tasks(taskService.getTasksByProjectId(project.getId()))
                .build();
    }
}