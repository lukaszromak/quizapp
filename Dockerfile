FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /workspace/app

COPY ./frontend ./frontend
COPY ./pom.xml .
COPY ./src ./src

RUN mvn clean install -DskipTests -P dev -q

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /workspace/app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

