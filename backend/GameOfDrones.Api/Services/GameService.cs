using GameOfDrones.Api.Data;
using GameOfDrones.Api.DTOs;
using GameOfDrones.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GameOfDrones.Api.Services;

public class GameService
{
    private readonly AppDbContext _db;

    public GameService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<GameResponse> StartGameAsync(StartGameRequest request)
    {
        var player1 = await GetOrCreatePlayerAsync(request.Player1Name);
        var player2 = await GetOrCreatePlayerAsync(request.Player2Name);

        var game = new Game { Player1Id = player1.Id, Player2Id = player2.Id };
        _db.Games.Add(game);
        await _db.SaveChangesAsync();

        return await GetGameResponseAsync(game.Id);
    }

    public async Task<GameResponse> SubmitRoundAsync(int gameId, SubmitRoundRequest request)
    {
        var game = await _db.Games
            .Include(g => g.Rounds)
            .FirstOrDefaultAsync(g => g.Id == gameId)
            ?? throw new KeyNotFoundException("Game not found");

        if (game.WinnerId.HasValue)
            throw new InvalidOperationException("Game is already finished");

        var rules = await _db.MoveRules.ToListAsync();

        int? roundWinnerId = DetermineRoundWinner(
            request.Player1MoveId, game.Player1Id,
            request.Player2MoveId, game.Player2Id,
            rules);

        var round = new Round
        {
            GameId = gameId,
            RoundNumber = game.Rounds.Count + 1,
            Player1MoveId = request.Player1MoveId,
            Player2MoveId = request.Player2MoveId,
            WinnerId = roundWinnerId
        };
        _db.Rounds.Add(round);
        await _db.SaveChangesAsync();

        await CheckAndFinalizeGameAsync(game);

        return await GetGameResponseAsync(gameId);
    }

    private static int? DetermineRoundWinner(
        int p1MoveId, int p1Id,
        int p2MoveId, int p2Id,
        List<MoveRule> rules)
    {
        if (rules.Any(r => r.KillerMoveId == p1MoveId && r.KilledMoveId == p2MoveId))
            return p1Id;
        if (rules.Any(r => r.KillerMoveId == p2MoveId && r.KilledMoveId == p1MoveId))
            return p2Id;
        return null;
    }

    private async Task CheckAndFinalizeGameAsync(Game game)
    {
        var rounds = await _db.Rounds.Where(r => r.GameId == game.Id).ToListAsync();

        var p1Wins = rounds.Count(r => r.WinnerId == game.Player1Id);
        var p2Wins = rounds.Count(r => r.WinnerId == game.Player2Id);

        int? gameWinnerId = null;
        if (p1Wins >= 3) gameWinnerId = game.Player1Id;
        else if (p2Wins >= 3) gameWinnerId = game.Player2Id;

        if (gameWinnerId.HasValue)
        {
            game.WinnerId = gameWinnerId;
            var winner = await _db.Players.FindAsync(gameWinnerId);
            if (winner != null) winner.TotalWins++;
            await _db.SaveChangesAsync();
        }
    }

    private async Task<Player> GetOrCreatePlayerAsync(string name)
    {
        var player = await _db.Players.FirstOrDefaultAsync(p => p.Name == name);
        if (player == null)
        {
            player = new Player { Name = name };
            _db.Players.Add(player);
            await _db.SaveChangesAsync();
        }
        return player;
    }

    public async Task<GameResponse> GetGameResponseAsync(int gameId)
    {
        var game = await _db.Games
            .Include(g => g.Player1)
            .Include(g => g.Player2)
            .Include(g => g.Winner)
            .Include(g => g.Rounds).ThenInclude(r => r.Player1Move)
            .Include(g => g.Rounds).ThenInclude(r => r.Player2Move)
            .Include(g => g.Rounds).ThenInclude(r => r.Winner)
            .FirstOrDefaultAsync(g => g.Id == gameId)
            ?? throw new KeyNotFoundException("Game not found");

        return MapToResponse(game);
    }

    private static GameResponse MapToResponse(Game game) => new(
        game.Id,
        new PlayerResponse(game.Player1.Id, game.Player1.Name, game.Player1.TotalWins),
        new PlayerResponse(game.Player2.Id, game.Player2.Name, game.Player2.TotalWins),
        game.Winner == null ? null : new PlayerResponse(game.Winner.Id, game.Winner.Name, game.Winner.TotalWins),
        game.Rounds.OrderBy(r => r.RoundNumber).Select(r => new RoundResponse(
            r.RoundNumber,
            r.Player1Move.Name,
            r.Player2Move.Name,
            r.Winner?.Name
        )).ToList()
    );
}
