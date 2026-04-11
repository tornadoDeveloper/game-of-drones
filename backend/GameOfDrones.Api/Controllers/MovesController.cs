using GameOfDrones.Api.Data;
using GameOfDrones.Api.DTOs;
using GameOfDrones.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameOfDrones.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MovesController : ControllerBase
{
    private readonly AppDbContext _db;

    public MovesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<MoveResponse>>> GetMoves()
    {
        var moves = await _db.Moves.Include(m => m.Kills).ToListAsync();
        return Ok(moves.Select(ToResponse).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<MoveResponse>> CreateMove([FromBody] CreateMoveRequest request)
    {
        var move = new Move { Name = request.Name };
        _db.Moves.Add(move);
        await _db.SaveChangesAsync();

        foreach (var killedId in request.KillsMoveIds)
            _db.MoveRules.Add(new MoveRule { KillerMoveId = move.Id, KilledMoveId = killedId });

        await _db.SaveChangesAsync();
        await _db.Entry(move).Collection(m => m.Kills).LoadAsync();
        return CreatedAtAction(nameof(GetMoves), ToResponse(move));
    }

    [HttpPut("{id}/rules")]
    public async Task<ActionResult<MoveResponse>> UpdateMoveRules(int id, [FromBody] UpdateMoveRulesRequest request)
    {
        var move = await _db.Moves.Include(m => m.Kills).FirstOrDefaultAsync(m => m.Id == id);
        if (move == null) return NotFound();

        _db.MoveRules.RemoveRange(move.Kills);
        foreach (var killedId in request.KillsMoveIds)
            _db.MoveRules.Add(new MoveRule { KillerMoveId = id, KilledMoveId = killedId });

        await _db.SaveChangesAsync();
        await _db.Entry(move).Collection(m => m.Kills).LoadAsync();
        return Ok(ToResponse(move));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMove(int id)
    {
        var move = await _db.Moves.Include(m => m.Kills).FirstOrDefaultAsync(m => m.Id == id);
        if (move == null) return NotFound();

        var rulesAsKilled = await _db.MoveRules.Where(r => r.KilledMoveId == id).ToListAsync();
        _db.MoveRules.RemoveRange(move.Kills);
        _db.MoveRules.RemoveRange(rulesAsKilled);
        _db.Moves.Remove(move);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static MoveResponse ToResponse(Move m) => new(
        m.Id, m.Name, m.Kills.Select(k => k.KilledMoveId).ToList()
    );
}
