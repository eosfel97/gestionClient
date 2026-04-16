package com.gestionclient.repository;



import com.gestionclient.entity.Client;
import com.gestionclient.enums.StatutClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    Page<Client> findByAssigneAId(Long userId, Pageable pageable);

    Page<Client> findByStatut(StatutClient statut, Pageable pageable);

    Page<Client> findByAssigneAIdAndStatut(Long userId, StatutClient statut, Pageable pageable);

    // Recherche par nom, prénom, entreprise ou email
    @Query("SELECT c FROM Client c WHERE " +
            "LOWER(c.nom) LIKE LOWER(CONCAT('%', :recherche, '%')) OR " +
            "LOWER(c.prenom) LIKE LOWER(CONCAT('%', :recherche, '%')) OR " +
            "LOWER(c.entreprise) LIKE LOWER(CONCAT('%', :recherche, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :recherche, '%'))")
    Page<Client> rechercher(@Param("recherche") String recherche, Pageable pageable);

    // Recherche pour un commercial spécifique
    @Query("SELECT c FROM Client c WHERE c.assigneA.id = :userId AND (" +
            "LOWER(c.nom) LIKE LOWER(CONCAT('%', :recherche, '%')) OR " +
            "LOWER(c.prenom) LIKE LOWER(CONCAT('%', :recherche, '%')) OR " +
            "LOWER(c.entreprise) LIKE LOWER(CONCAT('%', :recherche, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :recherche, '%')))")
    Page<Client> rechercherParCommercial(@Param("userId") Long userId,
                                         @Param("recherche") String recherche,
                                         Pageable pageable);


    long countByStatut(StatutClient statut);

    long countByAssigneAIdAndStatut(Long userId, StatutClient statut);

    long countByAssigneAId(Long userId);


    boolean existsByEmail(String email);
}