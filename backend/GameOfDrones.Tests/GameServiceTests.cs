using GameOfDrones.Api.Data;
using GameOfDrones.Api.DTOs;
using GameOfDrones.Api.Models;
using GameOfDrones.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace GameOfDrones.Tests;

public class GameServiceTests
{
    private static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var db = new AppDbContext(options);

        var rock = new Move { Id = 1, Name = "Rock" };
        var paper = new Move { Id = 2, Name = "Paper" };
        var scissors = new Move { Id = 3, Name = "Scissors" };
        db.Moves.AddRange(rock, paper, scissors);

        // Paper beats Rock, Rock beats Scissors, Scissors beats Paper
        db.MoveRules.AddRange(
            new MoveRule { Id = 1, KillerMoveId = 2, KilledMoveId = 1 },
            new MoveRule { Id = 2, KillerMoveId = 1, KilledMoveId = 3 },
            new MoveRule { Id = 3, KillerMoveId = 3, KilledMoveId = 2 }
        );

        db.SaveChanges();
        return db;
    }

    private static GameService CreateService(AppDbContext db) => new(db);

    // ── StartGame ──────────────────────────────────────────────────────────

    [Fact]
    public async Task StartGame_CreatesGameAndReturnsResponse()
    {
        var db = CreateDb();
        var service = CreateService(db);

        var result = await service.StartGameAsync(new StartGameRequest("Alice", "Bob"));

        Assert.Equal("Alice", result.Player1.Name);
        Assert.Equal("Bob", result.Player2.Name);
        Assert.Null(result.Winner);
        Assert.Empty(result.Rounds);
    }

    [Fact]
    public async Task StartGame_CreatesNewPlayersWhenTheyDontExist()
    {
        var db = CreateDb();
        var service = CreateService(db);

        await service.StartGameAsync(new StartGameRequest("Alice", "Bob"));

        Assert.Equal(2, db.Players.Count());
        Assert.True(db.Players.Any(p => p.Name == "Alice"));
        Assert.True(db.Players.Any(p => p.Name == "Bob"));
    }

    [Fact]
    public async Task StartGame_ReusesExistingPlayersByName()
    {
        var db = CreateDb();
        var service = CreateService(db);

        await service.StartGameAsync(new StartGameRequest("Alice", "Bob"));
        await service.StartGameAsync(new StartGameRequest("Alice", "Carlos"));

        Assert.Equal(3, db.Players.Count());
    }

    // ── SubmitRound ────────────────────────────────────────────────────────

    [Fact]
    public async Task SubmitRound_Player1WinsRoundWhenHerMoveKillsPlayer2Move()
    {
        var db = CreateDb();
        var service = CreateService(db);
        var game = await service.StartGameAsync(new StartGameRequest("Alice", "Bob"));

        // Rock (1) beats Scissors (3)
        var result = await service.SubmitRoundAsync(game.Id, new SubmitRoundRequest(1, 3));

        var round = result.Rounds.Single();
        Assert.Equal("Alice", round.WinnerName);
    }

    [Fact]
    public async Task SubmitRound_Player2WinsRoundWhenHerMoveKillsPlayer1Move()
    {
        var db = CreateDb();
        var service = CreateService(db);
        var game = await service.StartGameAsync(new StartGameRequest("Alice", "Bob"));

        // Paper (2) beats Rock (1) — Bob wins
        var result = await service.SubmitRoundAsync(game.Id, new SubmitRoundRequest(1, 2));

        Assert.Equal("Bob", result.Rounds.Single().WinnerName);
    }

    [Fact]
    public async Task SubmitRound_DrawWhenNeitherMoveKillsTheOther()
    {
        var db = CreateDb();
        var service = CreateService(db);
        var game = await service.StartGameAsync(new StartGameRequest("Alice", "Bob"));

        // Rock (1) vs Rock (1) — draw
        var result = await service.SubmitRoundAsync(game.Id, new SubmitRoundRequest(1, 1));

        Assert.Null(result.Rounds.Single().WinnerName);
        Assert.Null(result.Winner);
    }

    [Fact]
    public async Task SubmitRound_RoundNumberIncrementsSequentially()
    {
        var db = CreateDb();
        var service = CreateService(db);
        var game = await service.StartGameAsync(new StartGameRequest("Alice", "Bob"));

        await service.SubmitRoundAsync(game.Id, new SubmitRoundRequest(1, 1));
        var result = await service.SubmitRoundAsync(game.Id, new SubmitRoundRequest(2, 3));

        Assert.Equal(1, result.Rounds[0].RoundNumber);
        Assert.Equal(2, result.Rounds[1].RoundNumber);
    }

    // ── Game finalization ──────────────────────────────────────────────────

    [Fact]
    public async Task SubmitRound_GameFinalizesWhenAPlayerReachesThreeWins()
    {
        var db = CreateDb();
        var service = CreateService(db);
        var game = await service.StartGameAsync(new StartGameRequest("Alice", "Bob"));

        // Alice wins 3 rounds with Rock (1) vs Scissors (3)
        GameResponse? result = null;
        for (int i = 0; i < 3; i++)
            result = await service.SubmitRoundAsync(game.Id, new SubmitRoundRequest(1, 3));

        Assert.NotNull(result!.Winner);
        Assert.Equal("Alice", result.Winner.Name);
    }

    [Fact]
    public async Task SubmitRound_GameDoesNotFinalizeBeforeThreeWins()
    {
        var db = CreateDb();
        var service = CreateService(db);
        var game = await service.StartGameAsync(new StartGameRequest("Alice", "Bob"));

        await service.SubmitRoundAsync(game.Id, new SubmitRoundRequest(1, 3));
        var result = await service.SubmitRoundAsync(game.Id, new SubmitRoundRequest(1, 3));

        Assert.Null(result.Winner);
    }

    [Fact]
    public async Task SubmitRound_WinnerTotalWinsIsIncremented()
    {
        var db = CreateDb();
        var service = CreateService(db);
        var game = await service.StartGameAsync(new StartGameRequest("Alice", "Bob"));

        for (int i = 0; i < 3; i++)
            await service.SubmitRoundAsync(game.Id, new SubmitRoundRequest(1, 3));

        var alice = await db.Players.FirstAsync(p => p.Name == "Alice");
        Assert.Equal(1, alice.TotalWins);
    }

    [Fact]
    public async Task SubmitRound_LoserTotalWinsIsNotIncremented()
    {
        var db = CreateDb();
        var service = CreateService(db);
        var game = await service.StartGameAsync(new StartGameRequest("Alice", "Bob"));

        for (int i = 0; i < 3; i++)
            await service.SubmitRoundAsync(game.Id, new SubmitRoundRequest(1, 3));

        var bob = await db.Players.FirstAsync(p => p.Name == "Bob");
        Assert.Equal(0, bob.TotalWins);
    }

    [Fact]
    public async Task SubmitRound_ThrowsWhenGameIsAlreadyFinished()
    {
        var db = CreateDb();
        var service = CreateService(db);
        var game = await service.StartGameAsync(new StartGameRequest("Alice", "Bob"));

        for (int i = 0; i < 3; i++)
            await service.SubmitRoundAsync(game.Id, new SubmitRoundRequest(1, 3));

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.SubmitRoundAsync(game.Id, new SubmitRoundRequest(1, 3)));
    }

    [Fact]
    public async Task SubmitRound_ThrowsKeyNotFoundForUnknownGame()
    {
        var db = CreateDb();
        var service = CreateService(db);

        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => service.SubmitRoundAsync(999, new SubmitRoundRequest(1, 3)));
    }

    // ── GetGameResponse ────────────────────────────────────────────────────

    [Fact]
    public async Task GetGameResponse_ThrowsKeyNotFoundForUnknownGame()
    {
        var db = CreateDb();
        var service = CreateService(db);

        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => service.GetGameResponseAsync(999));
    }

    [Fact]
    public async Task GetGameResponse_RoundsAreOrderedByRoundNumber()
    {
        var db = CreateDb();
        var service = CreateService(db);
        var game = await service.StartGameAsync(new StartGameRequest("Alice", "Bob"));

        await service.SubmitRoundAsync(game.Id, new SubmitRoundRequest(1, 3));
        await service.SubmitRoundAsync(game.Id, new SubmitRoundRequest(2, 1));
        var result = await service.GetGameResponseAsync(game.Id);

        Assert.Equal(1, result.Rounds[0].RoundNumber);
        Assert.Equal(2, result.Rounds[1].RoundNumber);
    }
}
