# Game of Drones

A Rock-Paper-Scissors style battle game built with **Angular 17** and **.NET 10 Web API** with SQLite + Entity Framework Core.

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 18+](https://nodejs.org/) and npm
- Angular CLI: `npm install -g @angular/cli`

## Running the Backend

```bash
cd backend/GameOfDrones.Api

# Restore packages
dotnet restore

# Run the API (listens on http://localhost:5000)
# Migrations and database are created automatically on first run
dotnet run
```

> The SQLite database (`GameOfDrones.db`) is created automatically on startup via EF Core migrations.

## Running the Frontend (dev mode)

```bash
cd frontend/game-of-drones-app

# Install dependencies
npm install

# Start dev server (http://localhost:4200)
ng serve
```

## Running Tests

### Backend

```bash
cd backend/GameOfDrones.Tests
dotnet test
```

### Frontend

```bash
cd frontend/game-of-drones-app
npm test            # interactive watch mode
npm run test:ci     # single run (headless Chrome)
```

## Building for Production

The Angular app is configured to build directly into the backend's `wwwroot` folder, so the .NET API serves the frontend as static files:

```bash
cd frontend/game-of-drones-app
ng build --configuration production

cd ../../backend/GameOfDrones.Api
dotnet run
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

## Features

- Two-player Rock/Paper/Scissors on the same machine (players look away while opponent picks)
- First to 3 round wins takes the game
- Round-by-round score displayed in real time
- Player win history persisted in SQLite database
- **Runtime move configuration**: add new moves, delete moves, change kill rules between games — no server restart needed

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/games` | Start a new game |
| GET | `/api/games/{id}` | Get game state |
| POST | `/api/games/{id}/rounds` | Submit a round |
| GET | `/api/moves` | List all moves and rules |
| POST | `/api/moves` | Add a new move |
| PUT | `/api/moves/{id}/rules` | Update what a move kills |
| DELETE | `/api/moves/{id}` | Delete a move |
| GET | `/api/players` | Leaderboard (sorted by wins) |
