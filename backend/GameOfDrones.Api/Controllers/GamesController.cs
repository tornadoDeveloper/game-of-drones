using GameOfDrones.Api.DTOs;
using GameOfDrones.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GameOfDrones.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly GameService _gameService;

    public GamesController(GameService gameService)
    {
        _gameService = gameService;
    }

    [HttpPost]
    public async Task<ActionResult<GameResponse>> StartGame([FromBody] StartGameRequest request)
    {
        var game = await _gameService.StartGameAsync(request);
        return CreatedAtAction(nameof(GetGame), new { id = game.Id }, game);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GameResponse>> GetGame(int id)
    {
        try
        {
            return Ok(await _gameService.GetGameResponseAsync(id));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id}/rounds")]
    public async Task<ActionResult<GameResponse>> SubmitRound(int id, [FromBody] SubmitRoundRequest request)
    {
        try
        {
            return Ok(await _gameService.SubmitRoundAsync(id, request));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
