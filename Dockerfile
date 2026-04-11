# Build Angular frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend/game-of-drones-app

COPY frontend/game-of-drones-app/package*.json ./
RUN npm ci

COPY frontend/game-of-drones-app/ ./
RUN npm run build -- --configuration production

# Build .NET backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src

COPY backend/GameOfDrones.Api/*.csproj backend/GameOfDrones.Api/
RUN dotnet restore backend/GameOfDrones.Api/GameOfDrones.Api.csproj

COPY . .

COPY --from=frontend-build /app/backend/GameOfDrones.Api/wwwroot /src/backend/GameOfDrones.Api/wwwroot

WORKDIR /src/backend/GameOfDrones.Api
RUN dotnet publish -c Release -o /app/publish

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=backend-build /app/publish ./

ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080}
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "dotnet GameOfDrones.Api.dll"]