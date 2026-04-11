using System.Net;
using System.Net.Http.Json;
using GameOfDrones.Api.DTOs;

namespace GameOfDrones.Tests;

public class GamesControllerTests : IClassFixture<TestWebFactory>
{
    private readonly HttpClient _client;

    public GamesControllerTests(TestWebFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task PostGame_Returns201WithGameResponse()
    {
        var response = await _client.PostAsJsonAsync("/api/games",
            new { player1Name = "Alice", player2Name = "Bob" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<GameResponse>();
        Assert.NotNull(body);
        Assert.Equal("Alice", body.Player1.Name);
        Assert.Equal("Bob", body.Player2.Name);
        Assert.Null(body.Winner);
        Assert.Empty(body.Rounds);
    }

    [Fact]
    public async Task GetGame_Returns200ForExistingGame()
    {
        var created = await _client.PostAsJsonAsync("/api/games",
            new { player1Name = "Alice", player2Name = "Bob" });
        var game = await created.Content.ReadFromJsonAsync<GameResponse>();

        var response = await _client.GetAsync($"/api/games/{game!.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetGame_Returns404ForUnknownGame()
    {
        var response = await _client.GetAsync("/api/games/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task PostRound_Returns200WithUpdatedGame()
    {
        var created = await _client.PostAsJsonAsync("/api/games",
            new { player1Name = "Alice", player2Name = "Bob" });
        var game = await created.Content.ReadFromJsonAsync<GameResponse>();

        var response = await _client.PostAsJsonAsync($"/api/games/{game!.Id}/rounds",
            new { player1MoveId = 1, player2MoveId = 1 });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<GameResponse>();
        Assert.Single(body!.Rounds);
    }

    [Fact]
    public async Task PostRound_Returns404ForUnknownGame()
    {
        var response = await _client.PostAsJsonAsync("/api/games/99999/rounds",
            new { player1MoveId = 1, player2MoveId = 1 });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task PostRound_Returns400WhenGameIsAlreadyFinished()
    {
        var created = await _client.PostAsJsonAsync("/api/games",
            new { player1Name = "Alice", player2Name = "Bob" });
        var game = await created.Content.ReadFromJsonAsync<GameResponse>();

        // Alice wins 3 rounds: Rock (1) beats Scissors (3)
        for (int i = 0; i < 3; i++)
            await _client.PostAsJsonAsync($"/api/games/{game!.Id}/rounds",
                new { player1MoveId = 1, player2MoveId = 3 });

        var response = await _client.PostAsJsonAsync($"/api/games/{game!.Id}/rounds",
            new { player1MoveId = 1, player2MoveId = 3 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
