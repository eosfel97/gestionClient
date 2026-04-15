package com.gestionclient.repository;


import com.gestionclient.entity.Tache;
import com.gestionclient.enums.Priorite;
import com.gestionclient.enums.StatutTache;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TacheRepository extends JpaRepository<Tache, Long> {

    List<Tache> findByClientIdOrderByDateEcheanceAsc(Long clientId);

    Page<Tache> findByAssigneAId(Long userId, Pageable pageable);

    Page<Tache> findByStatut(StatutTache statut, Pageable pageable);

    Page<Tache> findByAssigneAIdAndStatut(Long userId, StatutTache statut, Pageable pageable);

    @Query("SELECT t FROM Tache t WHERE t.dateEcheance < :today AND t.statut <> 'TERMINEE'")
    List<Tache> findTachesEnRetard(@Param("today") LocalDate today);

    @Query("SELECT t FROM Tache t WHERE t.assigneA.id = :userId AND t.dateEcheance < :today AND t.statut <> 'TERMINEE'")
    List<Tache> findTachesEnRetardParUtilisateur(@Param("userId") Long userId,
                                                 @Param("today") LocalDate today);

    @Query("SELECT t FROM Tache t WHERE t.dateEcheance BETWEEN :debut AND :fin AND t.statut <> 'TERMINEE' ORDER BY t.dateEcheance ASC")
    List<Tache> findTachesAVenir(@Param("debut") LocalDate debut,
                                 @Param("fin") LocalDate fin);

    long countByStatut(StatutTache statut);

    long countByAssigneAIdAndStatut(Long userId, StatutTache statut);

    @Query("SELECT COUNT(t) FROM Tache t WHERE t.dateEcheance < :today AND t.statut <> 'TERMINEE'")
    long countTachesEnRetard(@Param("today") LocalDate today);

    @Query("SELECT COUNT(t) FROM Tache t WHERE t.assigneA.id = :userId AND t.dateEcheance < :today AND t.statut <> 'TERMINEE'")
    long countTachesEnRetardParUtilisateur(@Param("userId") Long userId,
                                           @Param("today") LocalDate today);

    long countByPriorite(Priorite priorite);

    long countByAssigneAIdAndPriorite(Long assigneAId, Priorite priorite);
}