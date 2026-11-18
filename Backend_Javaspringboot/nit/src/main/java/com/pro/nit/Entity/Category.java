package com.pro.nit.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, length = 50)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(nullable = false)
    private Boolean status = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.createdBy = "Admin"; // Will automatically set createdBy
        if (this.status == null) {
            this.status = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.updatedBy = "SoAm"; // Will automatically set updatedBy on update
    }
}

//package com.pro.nit.Entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.UpdateTimestamp;
//
//import java.time.LocalDateTime;
//
//@Entity
//@Setter
//@Getter
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class Category {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(nullable = false, length = 100)
//    private String name;
//
//    @Column(unique = true, length = 50)
//    private String code;
//
//    @Column(columnDefinition = "TEXT")
//    private String description;
//
//    @Builder.Default
//    @Column(nullable = false)
//    private Boolean status = true;
//
//    @CreationTimestamp
//    @Column(name = "created_at", updatable = false)
//    private LocalDateTime createdAt;
//
//    @Column(name = "created_by")
//    private String createdBy;
//
//    @UpdateTimestamp
//    @Column(name = "updated_at")
//    private LocalDateTime updatedAt;
//
//    @Column(name = "updated_by")
//    private String updatedBy;
//
//    @PrePersist
//    void onCreate(){
//        this.createdAt = LocalDateTime.now();
//        this.createdBy = "Admin";
//        if (this.status == null) this.status = true;
//    }
//    @PreUpdate
//    public void onUpdate(){
//        this.updatedAt = LocalDateTime.now();
//        this.updatedBy = "SoAm";
//    }
//}
