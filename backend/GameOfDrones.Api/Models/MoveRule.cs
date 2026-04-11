namespace GameOfDrones.Api.Models;

public class MoveRule
{
    public int Id { get; set; }
    public int KillerMoveId { get; set; }
    public Move KillerMove { get; set; } = null!;
    public int KilledMoveId { get; set; }
    public Move KilledMove { get; set; } = null!;
}
