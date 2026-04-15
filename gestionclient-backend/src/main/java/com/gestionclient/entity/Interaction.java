package com.gestionclient.entity;



import com.gestionclient.enums.TypeInteraction;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "interactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeInteraction type;

    @Column(nullable = false)
    private String sujet;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    @CreationTimestamp
    @Column(name = "date_interaction", updatable = false)
    private LocalDateTime dateInteraction;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auteur_id", nullable = false)
    private User auteur;
}