window.onload = function () {
	var canvas = document.getElementById("gameWorld");
	var ctx = canvas.getContext("2d");

	var gb = new GameBoard();
	//makeMove(gb, 2);

	var gameEngine = new GameEngine();
	var ai = new AIPlayer(gameEngine);
	gameEngine.stage = 2;
	gameEngine.init(ctx, gb, ai);
	gameEngine.start();
	gameEngine.AITurn();

	console.log("Game prepared!");
	
}