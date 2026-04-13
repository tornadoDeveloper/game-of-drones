# Build Angular frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend/game-of-drones-app

COPY frontend/game-of-drones-app/package*.json ./
RUN npm ci

COPY frontend/game-of-drones-app/ ./

# angular.json outputPath is ../../backend/GameOfDrones.Api/wwwroot
# from /app/frontend/game-of-drones-app that resolves to /app/backend/GameOfDrones.Api/wwwroot
RUN npm run build -- --configuration production


# Build .NET backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src

COPY backend/GameOfDrones.Api/*.csproj backend/GameOfDrones.Api/
RUN dotnet restore backend/GameOfDrones.Api/GameOfDrones.Api.csproj

COPY backend/ backend/

# Copy Angular build output into wwwroot
COPY --from=frontend-build /app/backend/GameOfDrones.Api/wwwroot \
     backend/GameOfDrones.Api/wwwroot/

WORKDIR /src/backend/GameOfDrones.Api
RUN dotnet publish GameOfDrones.Api.csproj -c Release -o /app/publish


# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

COPY --from=backend-build /app/publish ./

ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 10000

# Use shell form so $PORT is expanded at runtime (Render injects PORT=10000)
ENTRYPOINT ["sh", "-c", "exec dotnet GameOfDrones.Api.dll --urls http://0.0.0.0:${PORT:-8080}"]
