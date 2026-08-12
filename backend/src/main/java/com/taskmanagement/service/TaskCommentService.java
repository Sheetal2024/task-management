package com.taskmanagement.service;

import com.taskmanagement.dto.TaskCommentDTO;
import com.taskmanagement.model.Task;
import com.taskmanagement.model.TaskComment;
import com.taskmanagement.model.User;
import com.taskmanagement.repository.TaskCommentRepository;
import com.taskmanagement.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskCommentService {
    
    private final TaskCommentRepository taskCommentRepository;
    private final TaskRepository taskRepository;
    
    @Transactional(readOnly = true)
    public List<TaskCommentDTO> getTaskComments(Long taskId) {
        return taskCommentRepository.findByTaskId(taskId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public TaskCommentDTO addComment(TaskComment comment, User user) {
        Task task = taskRepository.findById(comment.getTask().getId())
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (!task.getProject().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        comment.setTask(task);
        comment.setUser(user);
        
        TaskComment saved = taskCommentRepository.save(comment);
        return convertToDTO(saved);
    }
    
    @Transactional
    public void deleteComment(Long id, User user) {
        TaskComment comment = taskCommentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        taskCommentRepository.delete(comment);
    }
    
    private TaskCommentDTO convertToDTO(TaskComment comment) {
        return TaskCommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .userName(comment.getUser().getName())
                .userId(comment.getUser().getId())
                .build();
    }
}