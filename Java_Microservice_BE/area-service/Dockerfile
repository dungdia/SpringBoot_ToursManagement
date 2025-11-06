# Dockerfile
FROM eclipse-temurin:21-jdk
# Thư mục làm việc trong container
WORKDIR /app
# Copy file JAR đã build từ Gradle
COPY build/libs/area-service-0.0.1-SNAPSHOT.jar app.jar
# Nếu bạn dùng Spring Boot (hoặc service Java chính)
ENTRYPOINT ["java", "-jar", "app.jar"]
