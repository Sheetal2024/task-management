package com.taskmanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Task> tasks = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public int getTotalTasks() {
        return tasks != null ? tasks.size() : 0;
    }
    
    public int getCompletedTasks() {
        if (tasks == null) return 0;
        return (int) tasks.stream().filter(Task::isCompleted).count();
    }
    
    public double getProgress() {
        int total = getTotalTasks();
        if (total == 0) return 0;
        return (double) getCompletedTasks() / total * 100;
    }
    
    public String getStatus() {
        int total = getTotalTasks();
        int completed = getCompletedTasks();
        
        if (total == 0 || completed == 0) {
            return "PENDING";
        } else if (completed == total) {
            return "ENDED";
        } else {
            return "RUNNING";
        }
    }
}