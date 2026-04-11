using System.ComponentModel.DataAnnotations;

namespace GameOfDrones.Api.DTOs;

public record StartGameRequest(
    [Required, StringLength(50, MinimumLength = 1)] string Player1Name,
    [Required, StringLength(50, MinimumLength = 1)] string Player2Name
);

public record SubmitRoundRequest(
    [Range(1, int.MaxValue)] int Player1MoveId,
    [Range(1, int.MaxValue)] int Player2MoveId
);

public record GameResponse(
    int Id,
    PlayerResponse Player1,
    PlayerResponse Player2,
    PlayerResponse? Winner,
    List<RoundResponse> Rounds
);

public record RoundResponse(
    int RoundNumber,
    string Player1Move,
    string Player2Move,
    string? WinnerName
);

public record PlayerResponse(int Id, string Name, int TotalWins);
