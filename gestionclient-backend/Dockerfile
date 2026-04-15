# ============================================
# GESTIONCLIENT BACKEND - Dockerfile
# ============================================

# ----- Étape 1 : Build -----
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copier le pom.xml d'abord pour profiter du cache Docker sur les dépendances
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copier le code source et compiler
COPY src ./src
RUN mvn clean package -Dmaven.test.skip=true -B

# ----- Étape 2 : Runtime -----
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copier le JAR depuis l'étape de build
COPY --from=build /app/target/*.jar app.jar

# Port exposé
EXPOSE 8080

# Lancer avec le profil Docker
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]