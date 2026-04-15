package com.gestionclient.entity;


import com.gestionclient.enums.Priorite;
import com.gestionclient.enums.StatutTache;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "taches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Priorite priorite = Priorite.MOYENNE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutTache statut = StatutTache.A_FAIRE;

    @Column(name = "date_echeance")
    private LocalDate dateEcheance;

    @Column(name = "date_rappel")
    private LocalDateTime dateRappel;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @UpdateTimestamp
    @Column(name = "date_modification")
    private LocalDateTime dateModification;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigne_a_id", nullable = false)
    private User assigneA;




    public boolean isEnRetard() {
        return dateEcheance != null
                && statut != StatutTache.TERMINEE
                && LocalDate.now().isAfter(dateEcheance);
    }
}