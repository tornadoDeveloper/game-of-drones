# ─── Stage 1: Build Angular frontend ────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/game-of-drones-app/package*.json ./
RUN npm ci

COPY frontend/game-of-drones-app/ ./

# angular.json sets outputPath to ../../backend/GameOfDrones.Api/wwwroot,
# so from /app/frontend the build writes to /app/backend/GameOfDrones.Api/wwwroot
RUN npm run build -- --configuration production


# ─── Stage 2: Build .NET backend ─────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build

WORKDIR /app

COPY game-of-drones.sln ./
COPY backend/ ./backend/

# Bring the compiled Angular assets into the expected wwwroot location
COPY --from=frontend-build /app/backend/GameOfDrones.Api/wwwroot \
     ./backend/GameOfDrones.Api/wwwroot/

WORKDIR /app/backend/GameOfDrones.Api

RUN dotnet publish GameOfDrones.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-self-contained


# ─── Stage 3: Runtime image ──────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

WORKDIR /app

COPY --from=backend-build /app/publish ./

# Render injects $PORT at runtime; fall back to 8080 for local testing
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "GameOfDrones.Api.dll"]
