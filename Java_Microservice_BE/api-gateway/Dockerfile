# Dockerfile
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY build/libs/api-gateway-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]