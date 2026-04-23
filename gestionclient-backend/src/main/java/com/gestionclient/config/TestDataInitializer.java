package com.gestionclient.config;

import com.gestionclient.entity.Client;
import com.gestionclient.entity.Interaction;
import com.gestionclient.entity.Tache;
import com.gestionclient.entity.User;
import com.gestionclient.enums.Role;
import com.gestionclient.enums.StatutClient;
import com.gestionclient.repository.ClientRepository;
import com.gestionclient.repository.InteractionRepository;
import com.gestionclient.repository.TacheRepository;
import com.gestionclient.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static com.gestionclient.config.TestDataConstants.*;
import static com.gestionclient.config.TestDataHelpers.*;

@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class TestDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final InteractionRepository interactionRepository;
    private final TacheRepository tacheRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${INIT_TEST_DATA:false}")
    private boolean initTestData;

    @Override
    public void run( String @NonNull ... args) {
        if (!initTestData) return;
        if (userRepository.count() > 1) {
            log.info("Donnees de test deja presentes - initialisation ignoree.");
            return;
        }

        log.info("Initialisation des donnees de test...");
        String motDePasse = passwordEncoder.encode("Test@1234");
        int clientGlobalIndex = 0;

        for (String[] comm : COMMERCIAUX) {
            User commercial = creerCommercial(comm, motDePasse);

            for (int i = 0; i < CLIENTS_PAR_COMMERCIAL; i++) {
                Client client = creerClient(clientGlobalIndex, i, commercial);
                creerInteraction(client, commercial, i);
                creerTache(client, commercial, i);
                clientGlobalIndex++;
            }

            log.info("Commercial {} {} cree avec {} clients uniques.",
                    comm[1], comm[0], CLIENTS_PAR_COMMERCIAL);
        }

        log.info("Donnees de test chargees : {} commerciaux, {} clients uniques.",
                COMMERCIAUX.length, clientGlobalIndex);
    }

    private User creerCommercial(String[] comm, String motDePasse) {
        return userRepository.save(User.builder()
                .nom(comm[0])
                .prenom(comm[1])
                .email(comm[2])
                .password(motDePasse)
                .role(Role.COMMERCIAL)
                .actif(true)
                .build());
    }

    private Client creerClient(int globalIndex, int i, User commercial) {
        String[] personne = PERSONNES[globalIndex % PERSONNES.length];
        String entreprise = ENTREPRISES[(globalIndex / PERSONNES.length + i) % ENTREPRISES.length];
        String nom = personne[0];
        String prenom = personne[1];

        String email = slug(prenom) + "." + slug(nom) + globalIndex + "@" + slug(entreprise) + ".fr";
        String telephone = String.format("06%08d", globalIndex + 1);
        String adresse = construireAdresse(globalIndex);
        StatutClient statut = STATUTS[globalIndex % STATUTS.length];

        return clientRepository.save(Client.builder()
                .nom(nom)
                .prenom(prenom)
                .entreprise(entreprise)
                .email(email)
                .telephone(telephone)
                .adresse(adresse)
                .statut(statut)
                .notes("Client gere par " + commercial.getPrenom() + " " + commercial.getNom())
                .assigneA(commercial)
                .build());
    }

    private void creerInteraction(Client client, User commercial, int i) {
        interactionRepository.save(Interaction.builder()
                .type(typePour(i))
                .sujet("Premier contact - " + client.getEntreprise())
                .contenu("Prise de contact initiale avec " + client.getPrenom()
                        + " " + client.getNom() + " de " + client.getEntreprise())
                .client(client)
                .auteur(commercial)
                .dateInteraction(LocalDateTime.now().minusDays(i + 1L))
                .build());
    }

    private void creerTache(Client client, User commercial, int i) {
        tacheRepository.save(Tache.builder()
                .titre("Suivi " + client.getEntreprise())
                .description("Faire un suivi avec " + client.getPrenom() + " " + client.getNom())
                .priorite(prioritePour(i))
                .statut(statutTachePour(i))
                .dateEcheance(LocalDate.now().plusDays(i + 3L))
                .client(client)
                .assigneA(commercial)
                .build());
    }
}