namespace GameOfDrones.Api.Models;

public class Move
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ICollection<MoveRule> Kills { get; set; } = new List<MoveRule>();
}
