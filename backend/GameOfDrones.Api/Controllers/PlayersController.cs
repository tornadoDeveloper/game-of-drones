using GameOfDrones.Api.Data;
using GameOfDrones.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameOfDrones.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly AppDbContext _db;

    public PlayersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<PlayerResponse>>> GetPlayers()
    {
        var players = await _db.Players
            .OrderByDescending(p => p.TotalWins)
            .Select(p => new PlayerResponse(p.Id, p.Name, p.TotalWins))
            .ToListAsync();
        return Ok(players);
    }
}
