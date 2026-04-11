namespace GameOfDrones.Api.Models;

public class Game
{
    public int Id { get; set; }
    public int Player1Id { get; set; }
    public Player Player1 { get; set; } = null!;
    public int Player2Id { get; set; }
    public Player Player2 { get; set; } = null!;
    public int? WinnerId { get; set; }
    public Player? Winner { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Round> Rounds { get; set; } = new List<Round>();
}
