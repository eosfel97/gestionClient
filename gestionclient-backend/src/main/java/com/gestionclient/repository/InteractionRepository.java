package com.gestionclient.repository;




import com.gestionclient.entity.Interaction;
import com.gestionclient.enums.TypeInteraction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InteractionRepository extends JpaRepository<Interaction, Long> {

    Page<Interaction> findByClientIdOrderByDateInteractionDesc(Long clientId, Pageable pageable);

    Page<Interaction> findByClientIdAndType(Long clientId, TypeInteraction type, Pageable pageable);

    Page<Interaction> findByAuteurId(Long userId, Pageable pageable);

    List<Interaction> findTop10ByOrderByDateInteractionDesc();

    List<Interaction> findTop10ByAuteurIdOrderByDateInteractionDesc(Long userId);

    long countByClientId(Long clientId);

    long countByDateInteractionBetween(LocalDateTime debut, LocalDateTime fin);

    long countByAuteurIdAndDateInteractionBetween(Long userId, LocalDateTime debut, LocalDateTime fin);


    long countByType(TypeInteraction type);

    long countByAuteurIdAndType(Long auteurId, TypeInteraction type);
}