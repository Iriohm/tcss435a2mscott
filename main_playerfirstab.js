window.onload = function () {
	var canvas = document.getElementById("gameWorld");
	var ctx = canvas.getContext("2d");

	var gb = new GameBoard();
	// var sn = new StateNode(gb);
	// sn.generateMoves(1);
	// for	(var c = 0; c < sn.children.length; c++) {
		// var child = sn.children[c];
		// child.board.printState();
		// console.log(child.board.utilityValue(1));
	// }

	var gameEngine = new GameEngine();
	var ai = new AIPlayer(gameEngine);
	gameEngine.init(ctx, gb, ai);
	gameEngine.start();

	console.log("Game prepared!");
	
}