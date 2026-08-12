package com.taskmanagement.controller;

import com.taskmanagement.dto.TaskCommentDTO;
import com.taskmanagement.model.TaskComment;
import com.taskmanagement.model.User;
import com.taskmanagement.repository.UserRepository;
import com.taskmanagement.service.TaskCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class TaskCommentController {
    
    private final TaskCommentService taskCommentService;
    private final UserRepository userRepository;
    
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TaskCommentDTO>> getTaskComments(@PathVariable Long taskId) {
        return ResponseEntity.ok(taskCommentService.getTaskComments(taskId));
    }
    
    @PostMapping
    public ResponseEntity<TaskCommentDTO> addComment(
            @Valid @RequestBody TaskComment comment,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(taskCommentService.addComment(comment, user));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        taskCommentService.deleteComment(id, user);
        return ResponseEntity.ok().build();
    }
}