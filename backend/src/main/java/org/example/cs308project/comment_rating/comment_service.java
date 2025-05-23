package org.example.cs308project.comment_rating;

import org.example.cs308project.loginregister.model.register_model;
import org.example.cs308project.loginregister.repository.register_repository;
import org.example.cs308project.products.product_model;
import org.example.cs308project.products.product_repository;
import org.example.cs308project.notification.notification_model;
import org.example.cs308project.notification.notification_repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class comment_service {

    @Autowired
    private comment_repository commentRepository;

    @Autowired
    private register_repository userRepository;

    @Autowired
    private product_repository productRepository;

    @Autowired
    private notification_repository notificationRepo;

    // Add a new comment
    public comment_model addComment(Long userId, Long productId, String text, int rating) {
        Optional<register_model> user = userRepository.findById(userId);
        Optional<product_model> product = productRepository.findById(productId);

        if (user.isPresent() && product.isPresent()) {
            comment_model comment = new comment_model();
            comment.setUser(user.get());
            comment.setProduct(product.get());
            comment.setText(text);
            comment.setRating(rating);

            // 🛠 NEW LOGIC:
            if (text == null || text.trim().isEmpty()) {
                comment.setApproved(true); // ✅ No comment -> auto-approved
            } else {
                comment.setApproved(false); // ❗ Has comment -> needs approval
            }

            return commentRepository.save(comment);
        }
        return null;
    }

    // Get all comments for a product
    public List<comment_model> getCommentsByProduct(Long productId) {
        return commentRepository.findByProductId(productId);
    }

    public double getAverageRatingByProductId(Long productId) {
        List<comment_model> comments = commentRepository.findByProductId(productId);
        if (comments.isEmpty()) return 0.0;

        double sum = 0;
        for (comment_model comment : comments) {
            sum += comment.getRating();
        }
        return sum / comments.size();
    }

    public String addRating(Long userId, Long productId, int rating) {
        Optional<register_model> user = userRepository.findById(userId);
        Optional<product_model> product = productRepository.findById(productId);

        if (user.isPresent() && product.isPresent()) {
            comment_model comment = new comment_model();
            comment.setUser(user.get());
            comment.setProduct(product.get());
            comment.setText(""); // Empty comment
            comment.setRating(rating);
            comment.setApproved(true);
            commentRepository.save(comment);
            return "Rating added.";
        }
        return "User or product not found.";
    }

    public List<Integer> getRatingsByUserId(Long userId) {
        List<comment_model> comments = commentRepository.findByUserId(userId);
        return comments.stream()
                .map(comment_model::getRating)
                .filter(rating -> rating > 0)
                .toList();
    }

    public List<Integer> getRatingsByProductId(Long productId) {
        List<comment_model> comments = commentRepository.findByProductId(productId);
        return comments.stream()
                .map(comment_model::getRating)
                .filter(rating -> rating > 0)
                .toList();
    }

    // Get all comments by a user
    public List<comment_model> getCommentsByUser(Long userId) {
        return commentRepository.findByUserId(userId);
    }

    public List<comment_model> getPendingComments() {
        return commentRepository.findByApprovedFalse();
    }

    public comment_model approveComment(Long commentId) {
        Optional<comment_model> opt = commentRepository.findById(commentId);
        if (opt.isPresent()) {
            comment_model cm = opt.get();
            cm.setApproved(true);
            comment_model updated = commentRepository.save(cm);

            // Send notification to user
            notification_model note = new notification_model();
            note.setUser(cm.getUser());
            note.setMessage("✅ Your comment was approved by admin.");
            note.setTimestamp(LocalDateTime.now());
            notificationRepo.save(note);

            return updated;
        }
        throw new RuntimeException("Comment not found");
    }

    public void rejectComment(Long commentId) {
        Optional<comment_model> opt = commentRepository.findById(commentId);
        if (opt.isPresent()) {
            comment_model cm = opt.get();

            // Send notification to user
            notification_model note = new notification_model();
            note.setUser(cm.getUser());
            note.setMessage("❌ Your comment was rejected by admin.");
            note.setTimestamp(LocalDateTime.now());
            notificationRepo.save(note);

            commentRepository.deleteById(commentId);
        }
    }

    public comment_model editComment(Long commentId, String newText) {
        Optional<comment_model> opt = commentRepository.findById(commentId);
        if (opt.isPresent()) {
            comment_model cm = opt.get();
            cm.setText(newText);
            return commentRepository.save(cm);
        }
        throw new RuntimeException("Comment not found");
    }

    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }

    public List<comment_model> getApprovedCommentsByProduct(Long productId) {
        return commentRepository.findByProductId(productId)
                .stream()
                .filter(comment -> comment.isApproved())
                .toList();
    }

    public List<comment_model> getAllApprovedComments() {
        return commentRepository.findByApprovedTrue();
    }

}
