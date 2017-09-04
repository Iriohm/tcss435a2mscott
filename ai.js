var absearch = 0;
var mmsearch = 0;
var proons = 0;

function AIPlayer(gameengine) {
	this.game = gameengine;
	
}

AIPlayer.prototype.pickMove = function (depth, piece, useAB) {
	// Thinking...
	absearch = 0;
	mmsearch = 0;
	proons = 0;
	
	var inistate = new StateNode(this.game.gameboard);
	var child = 0;
	
	if	(piece > 0) {
		if	(useAB) {
			abSearch(inistate, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, depth, true);
		} else {
			minimaxSearch(inistate, depth, false);
		}
		// inistate.generateMoves();
		// for	(var c = 0; c < inistate.children.length; c++) {
			// inistate.children[c].value = inistate.children[c].board.utilityValue();
			
		// }
		
		
		//console.log("Options considered: " + inistate.children.length);
		var child = 0;
		var max = Number.NEGATIVE_INFINITY;
		
		for	(var c = 0; c < inistate.children.length; c++) {
			if	(inistate.children[c].value > max) {
				max = inistate.children[c].value;
				child = c;
			}
			//console.log("Value : " + inistate.children[c].value);
			
		}
		
		//console.log("Picked a value of " + inistate.children[child].value);
		
	} else {
		if	(useAB) {
			abSearch(inistate, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, depth, false);
		} else {
			minimaxSearch(inistate, depth, false);
		}
		// inistate.generateMoves();
		// for	(var c = 0; c < inistate.children.length; c++) {
			// inistate.children[c].value = inistate.children[c].board.utilityValue();
			
		// }
		
		inistate.children.sort(function(a, b) {
			return a.value - b.value;
		});
		
		var child = 0;
		var max = Number.POSITIVE_INFINITY;
		
		for	(var c = 0; c < inistate.children.length; c++) {
			if	(inistate.children[c].value > max) {
				max = inistate.children[c].value;
				child = c;
			}
			//console.log("Value : " + inistate.children[c].value);
			
		}
		
		//console.log("Options considered: " + inistate.children.length);
		//console.log("Picked a value of " + inistate.children[child].value);
		
	}
	
	//console.log("Data: " + inistate.children[child].data);
	console.log("Minmax: " + mmsearch);
	console.log("AB: " + absearch);
	console.log("Proons: " + proons);
	return inistate.children[child].data;
	
}


// Minimax search algorithm. Recursive. Will assign all values of all nodes up to a given depth.
function minimaxSearch(node, maxdepth, maximizing) {
	var child;
	var value = 0;
	var player = 0;
	var opponent = 0;
	if	(maximizing) {
		player = 1;
		opponent = -1;
	} else {
		player = -1;
		opponent = 1;
	}
	
	// If this node is at the maximum depth, calculate its utility value.
	if	(node.depth >= maxdepth) {
		value = node.board.utilityValue(opponent);

	// Otherwise, if this is a maximizer node...
	} else if	(maximizing) {
		node.generateMoves(player);
		
		for	(var count = 0; count < node.children.length; count++) {
			child = node.children[count];
			child.value = minimaxSearch(child, maxdepth, false);
			value = Math.max(value, child.value);

		}

		node.value = value;
		
	// Other-otherwise, if this is a minimizer node...
	} else {
		node.generateMoves(player);
		
		for	(var count = 0; count < node.children.length; count++) {
			child = node.children[count];
			child.value = minimaxSearch(child, maxdepth, true);
			value = Math.min(value, child.value);

		}
		
		node.value = value;

	}
	
	//console.log("MINIMAX_SEARCH");
	mmsearch++;
	
	return value;

}


// Alpha-Beta Pruning Search implementation. Recursive. Will assign all values of all (unpruned) nodes up to a given depth.
function abSearch(node, alpha, beta, maxdepth, maximizing) {
	var child;
	var value = 0;
	var player = 0;
	var opponent = 0;
	if	(maximizing) {
		player = 1;
		opponent = -1;
	} else {
		player = -1;
		opponent = 1;
	}
	
	// If this node is at the maximum depth, calculate its utility value.
	if	(node.depth >= maxdepth) {
		value = node.board.utilityValue(opponent);
		node.value = value;

	// Otherwise, if this is a maximizer node...
	} else if	(maximizing) {
		node.generateMoves(player);
		value = alpha;
		
		for	(var count = 0; count < node.children.length; count++) {
			child = node.children[count];
			child.value = abSearch(child, value, beta, maxdepth, false);
			value = Math.max(value, child.value);
			alpha = value;
			
			if	(beta <= alpha) {
				proons++;
				break;
			}

		}

		node.value = value;
		
	// Other-otherwise, if this is a minimizer node...
	} else {
		node.generateMoves(player);
		value = beta;
		
		for	(var count = 0; count < node.children.length; count++) {
			child = node.children[count];
			child.value = abSearch(child, alpha, value, maxdepth, true);
			value = Math.min(value, child.value);
			beta = value;
			
			if	(beta <= alpha) {
				proons++;
				break;
			}

		}
		
		node.value = value;

	}
	
	//console.log("AB_SEARCH - DEPTH: " + node.depth + " - VALUE: " + value);
	absearch++;
	
	return value;

}


function StateNode(board) {
	this.board = board;
	this.parent = null;
	this.children = [];
	this.child = 0;
	this.depth = 0;
	this.value = 0;
	this.data = [0, 0, 0, "n/a"];
}


StateNode.prototype.addChild = function (board) {
	var node = new StateNode(board);
	
	node.parent = this;
	node.depth = this.depth + 1;
	
	this.children.push(node);
	
}


StateNode.prototype.generateMoves = function (piece) {
	var gb = this.board;	
	
	for	(var y = 0; y < 6; y++) {
		for	(var x = 0; x < 6; x++) {
			//A move can be made here.
			if	(gb.board[y][x] === 0) {
				// Add a basic "piece placed" move to the children.
				var copy = gb.copy();
				copy.board[y][x] = piece;
				var node = new StateNode(copy);
				node.parent = this;
				node.depth = this.depth + 1;
				node.data[0] = x;
				node.data[1] = y;
				this.children.push(node);
				
				// Add all moves where a piece is rotated. 
				for	(var quad = 1; quad < 5; quad++) {
					var c1 = copy.copy();
					var c2 = copy.copy();
					
					c1.rotateQuadrant(quad, "CW");
					c2.rotateQuadrant(quad, "CCW");
					
					node = new StateNode(c1);
					node.parent = this;
					node.depth = this.depth + 1;
					node.data[0] = x;
					node.data[1] = y;
					node.data[2] = quad;
					node.data[3] = "CW";
					this.children.push(node);
					
					node = new StateNode(c2);
					node.parent = this;
					node.depth = this.depth + 1;
					node.data[0] = x;
					node.data[1] = y;
					node.data[2] = quad;
					node.data[3] = "CCW";
					this.children.push(node);
					
				}
				
			}
			
		}		
		
	}
	
}


// Unused code. Might need it later. Who knows.
function getQuadrant(x, y) {
	if (x >= 3 && y < 3) {
		return 2;
	} else if (x < 3 && y >= 3) {
		return 3;
	} else if (x >= 3 && y >= 3) {
		return 4;
	} else {
		return 1;
	}
	
}