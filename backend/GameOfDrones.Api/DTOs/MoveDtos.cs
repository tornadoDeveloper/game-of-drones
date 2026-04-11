using System.ComponentModel.DataAnnotations;

namespace GameOfDrones.Api.DTOs;

public record MoveResponse(int Id, string Name, List<int> KillsMoveIds);

public record CreateMoveRequest(
    [Required, StringLength(50, MinimumLength = 1)] string Name,
    [Required] List<int> KillsMoveIds
);

public record UpdateMoveRulesRequest(
    [Required] List<int> KillsMoveIds
);
