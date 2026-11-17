
# Stage 1: Build Spring Boot application
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

COPY mvnw pom.xml ./
COPY .mvn .mvn

RUN chmod +x mvnw

COPY src ./src

RUN ./mvnw -B -DskipTests clean package

# Stage 2: Run application
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/nit-0.0.1-SNAPSHOT.jar app.jar

RUN mkdir -p /app/uploads

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

