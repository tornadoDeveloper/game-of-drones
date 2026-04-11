using GameOfDrones.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GameOfDrones.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Player> Players => Set<Player>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<Round> Rounds => Set<Round>();
    public DbSet<Move> Moves => Set<Move>();
    public DbSet<MoveRule> MoveRules => Set<MoveRule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MoveRule>()
            .HasOne(r => r.KillerMove)
            .WithMany(m => m.Kills)
            .HasForeignKey(r => r.KillerMoveId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MoveRule>()
            .HasOne(r => r.KilledMove)
            .WithMany()
            .HasForeignKey(r => r.KilledMoveId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Game>()
            .HasOne(g => g.Player1)
            .WithMany()
            .HasForeignKey(g => g.Player1Id)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Game>()
            .HasOne(g => g.Player2)
            .WithMany()
            .HasForeignKey(g => g.Player2Id)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Game>()
            .HasOne(g => g.Winner)
            .WithMany()
            .HasForeignKey(g => g.WinnerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Round>()
            .HasOne(r => r.Winner)
            .WithMany()
            .HasForeignKey(r => r.WinnerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Move>().HasData(
            new Move { Id = 1, Name = "Rock" },
            new Move { Id = 2, Name = "Paper" },
            new Move { Id = 3, Name = "Scissors" }
        );

        modelBuilder.Entity<MoveRule>().HasData(
            new MoveRule { Id = 1, KillerMoveId = 2, KilledMoveId = 1 },
            new MoveRule { Id = 2, KillerMoveId = 1, KilledMoveId = 3 },
            new MoveRule { Id = 3, KillerMoveId = 3, KilledMoveId = 2 }
        );
    }
}
