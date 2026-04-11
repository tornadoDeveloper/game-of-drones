namespace GameOfDrones.Api.Models;

public class Round
{
    public int Id { get; set; }
    public int GameId { get; set; }
    public Game Game { get; set; } = null!;
    public int RoundNumber { get; set; }
    public int Player1MoveId { get; set; }
    public Move Player1Move { get; set; } = null!;
    public int Player2MoveId { get; set; }
    public Move Player2Move { get; set; } = null!;
    public int? WinnerId { get; set; }
    public Player? Winner { get; set; }
}
