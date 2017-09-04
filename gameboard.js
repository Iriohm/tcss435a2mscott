function GameBoard() {
	this.board = [[0, 0, 0, 0, 0, 0],
				  [0, 0, 0, 0, 0, 0],
				  [0, 0, 0, 0, 0, 0],
				  [0, 0, 0, 0, 0, 0],
				  [0, 0, 0, 0, 0, 0],
				  [0, 0, 0, 0, 0, 0]];
	
}


GameBoard.prototype.copy = function () {
	var new_board = new GameBoard();
	
	for (var y = 0; y < 6; y++) {
		for (var x = 0; x < 6; x++) {
			new_board.board[y][x] = this.board[y][x];
			
		}
		
	}
	
	return new_board;
	
}


GameBoard.prototype.checkGoalState = function () {
	var value = 0;
	var total = 0;
	var tie = false;
	
	// Search vertically.
	for	(var x = 0; x < 6; x++) {
		value = this.checkIsGoalAt(x, 0, 0, 1, 6);
		if	(value !== 0) { tie = true; }
		total += value;
	}
	
	// Search horizontally.
	for	(var y = 0; y < 6; y++) {
		value = this.checkIsGoalAt(0, y, 1, 0, 6);
		if	(value !== 0) { tie = true; }
		total += value;
	}
	
	// Search downwards slope.
	value = this.checkIsGoalAt(1, 0, 1, 1, 5);
	if	(value !== 0) { tie = true; }
	total += value;
	value = this.checkIsGoalAt(0, 0, 1, 1, 6);
	if	(value !== 0) { tie = true; }
	total += value;
	value = this.checkIsGoalAt(0, 1, 1, 1, 5);
	if	(value !== 0) { tie = true; }
	total += value;
	
	// Search upwards slope.
	value = this.checkIsGoalAt(4, 0, -1, 1, 5);
	if	(value !== 0) { tie = true; }
	total += value;
	value = this.checkIsGoalAt(5, 0, -1, 1, 6);
	if	(value !== 0) { tie = true; }
	total += value;
	value = this.checkIsGoalAt(5, 1, -1, 1, 5);
	if	(value !== 0) { tie = true; }
	total += value;

	if	(total > 0) { return 'max'; }
	else if	(total < 0) { return 'min'; }
	else if	(total === 0 && tie) { return 'tie'; }
	else { return 'nope'; }
	
}


// Rates a single sequence of pieces based on its utility for both players.
GameBoard.prototype.checkIsGoalAt = function (startX, startY, deltaX, deltaY, length) {
	var max = 0;
	var min = 0;
	
	for	(var c = 0; c < length; c++) {
		piece = this.board[startY + (c * deltaY)][startX + (c * deltaX)];
		
		if	(piece > 0) {
			max++;
			if	(max > 4) { break; }
			min = 0;
		} else if	(piece < 0) {
			min--;
			if	(min < -4) { break; }
			max = 0;			
		} else {
			max = 0;
			min = 0;
		}
		
	}
	
	if	(max > 4) { return 1; }
	else if	(min < -4) { return -1; }
	else { return 0; }
	
}


// Rates the utility value of an entire board.
GameBoard.prototype.utilityValue = function (player) {
	var value = 0;
	var test = 0;
	
	// Search vertically.
	for	(var x = 0; x < 6; x++) {
		test = this.rateSequence(x, 0, 0, 1, 6, player);
		value += test;
		//console.log("Value of column " + (x + 1) + " is " + test);
	}
	
	// Search horizontally.
	for	(var y = 0; y < 6; y++) {
		test = this.rateSequence(0, y, 1, 0, 6, player);
		value += test;
		//console.log("Value of row " + (y + 1) + " is " + test);
	}
	
	// Search downwards slope.
	value += this.rateSequence(1, 0, 1, 1, 5, player);
	value += this.rateSequence(0, 0, 1, 1, 6, player);
	value += this.rateSequence(0, 1, 1, 1, 5, player);
	
	// Search upwards slope.
	value += this.rateSequence(4, 0, -1, 1, 5, player);
	value += this.rateSequence(5, 0, -1, 1, 6, player);
	value += this.rateSequence(5, 1, -1, 1, 5, player);
	
	//console.log("Utility Value is " + value);
	return value;
	
}


// Rates a single sequence of pieces based on its utility for both players.
GameBoard.prototype.rateSequence = function (startX, startY, deltaX, deltaY, length, player) {
	var maxmult = 0;
	var minmult = 0;
	var maxpieces = 0;
	var minpieces = 0;
	var value = 0;
	var piece = 0;
	
	if	(player > 0) {
		for	(var c = 0; c < length; c++) {
			piece = this.board[startY + (c * deltaY)][startX + (c * deltaX)];
			
			if	(piece > 0) {
				maxmult++;
				maxpieces++;
				if	(maxmult > 4) { maxmult = 25; }
				if	(maxmult > 1) { value += Math.pow(10, maxmult); }
				
			} else if	(piece < 0) {
				if	((c + 1) < 5 && length - (c + 1) < 5) {
					value = 0;
					break;
				}
				minpieces++;
				maxmult = 0;
				
			} else {
				maxmult = 0;
				
			}
			
		}
		
		//value += Math.pow(10, Math.abs(minpieces - maxpieces));
		
	} else {
		for	(var c = 0; c < length; c++) {
			piece = this.board[startY + (c * deltaY)][startX + (c * deltaX)];
		
			if	(piece < 0) {
				minmult++;
				minpieces++;
				if	(minmult > 4) { minmult = 25; }
				if	(minmult > 1) { value -= Math.pow(10, minmult); }
				
			} else if	(piece > 0) {
				if	((c + 1) < 5 && length - (c + 1) < 5) {
					value = 0;
					break;
				}
				maxpieces++;
				minmult = 0;
				
			} else {
				minmult = 0;
				
			}
			
		}
		
		//value -= Math.pow(10, Math.abs(minpieces - maxpieces));
		
	}
	
	//console.log("rateSequence() says value is " + value);
	
	return value;
	
}


// Rotates a quadrant of the board depending on the value of "direction" ("CW" or "CCW").
GameBoard.prototype.rotateQuadrant = function (quadrant, direction) {
	var dY = 0;
	var dX = 0;
	
	if	(quadrant === 2) {
		dX = 3;
	
	} else if	(quadrant === 3) {
		dY = 3;
	
	} else if	(quadrant === 4) {
		dX = 3;
		dY = 3;
		
	}
	
	var temp = [[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0]];
	
	for	(var y = 0; y < 3; y++) {
		for	(var x = 0; x < 3; x++) {
			if	(direction === "CW") {
				temp[x][2 - y] = this.board[y + dY][x + dX];
			} else if (direction === "CCW") {
				temp[2 - x][y] = this.board[y + dY][x + dX];
			}
			
		}
		
	}
	
	for	(var y = 0; y < 3; y++) {
		for	(var x = 0; x < 3; x++) {
			this.board[y + dY][x + dX] = temp[y][x];
			
		}
		
	}
	
}

GameBoard.prototype.printState = function () {
	console.log("0: =============");	
	for	(var y = 0; y < 6; y++) {
		console.log((y + 1) + ": |" + this.board[y][0] 
					+     "|" + this.board[y][1] 
					+     "|" + this.board[y][2] 
					+     "|" + this.board[y][3] 
					+     "|" + this.board[y][4] 
					+     "|" + this.board[y][5] + "|");
	}
	console.log("7: =============");
	
}