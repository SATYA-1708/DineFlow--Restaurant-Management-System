# Multi-stage Docker build for Spring Boot Backend
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/restaurant-management-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 10000 8081
# Keep JVM memory strictly within Render's 512MB free tier limit
ENTRYPOINT ["java", "-Xmx384m", "-Xss512k", "-XX:+UseSerialGC", "-jar", "app.jar"]
