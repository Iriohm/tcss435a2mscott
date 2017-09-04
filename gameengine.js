// Original code provided by C. Marriott of TCSS 491
// Heavily modified, and assumed to be 

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

function GameEngine() {
    this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
	this.gameboard = null;
	/*
	Stage represents the "part" of the game the engine is currently in.
		0 : Player's turn to place a piece
		1 : Player's turn to rotate a quadrant
		2 : AI's turn to place a piece
		3 : AI's turn to rotate a quadrant
		4 : Victory for the player
		5 : Victory for the AI
		6 : Tie
	*/
	this.stage = 0;
	this.playerPiece = 1;
	this.AIPiece = -1;
	this.piecesleft = 36;
	this.aioutput = "Waiting for Player";
	this.useABSearch = true;
}

GameEngine.prototype.init = function (ctx, gameboard, ai) {
    this.ctx = ctx;
	this.gameboard = gameboard;
	this.ai = ai;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
	this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Beginning input');

    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        return { x: x, y: y };
    }

    var that = this;
	that.digits = [false, false, false];

    // event listeners are added here

    this.ctx.canvas.addEventListener("click", function (e) {
		if	(that.stage === 0 || that.stage === 1) {
			that.click = getXandY(e);
			that.click_x = e.x - 8;
			that.click_y = e.y - 8;
			that.mouseclick = true;
		}
    }, false);

    this.ctx.canvas.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    }, false);

    this.ctx.canvas.addEventListener("mousemove", function (e) {
		that.mouse = getXandY(e);
		that.mouse_x = e.x - 8;
		that.mouse_y = e.y - 8;
    }, false);

}

GameEngine.prototype.update = function () {
    this.ctx.clearRect(20, 20, this.surfaceWidth, this.surfaceHeight);
    this.ctx.save();

	// DRAW CODE HERE
	drawBoard(this, this.gameboard, 20, 20, this.surfaceHeight - 40);
	drawButtons(this, this.surfaceHeight, 20, this.surfaceWidth - this.surfaceHeight - 20, this.surfaceHeight - 40);
	this.mouseclick = false;	
	
	console.log("Stage = " + this.stage);
	
    this.ctx.restore();
}

// Places a piece for some player.
GameEngine.prototype.placePiece = function (x, y, piece) {
	this.gameboard.board[y][x] = piece;
	this.piecesleft--;
    console.log('Pieces left: ' + this.piecesleft);
	this.checkGoal();
}

// Rotate a quadrant for some player.
GameEngine.prototype.rotateQuadrant = function (quadrant, direction) {
	this.gameboard.rotateQuadrant(quadrant, direction);
	if	(this.checkGoal() === false) {
		if	(this.stage === 2) {
			this.stage = 3;
			this.AITurn();
		
		} else if	(this.stage === 4) {
			this.stage = 0;
		}
		
	}

	
}

// Makes the AI take a turn.
GameEngine.prototype.AITurn = function () {
	if	(this.checkGoal() === false) {		
		var depth = 2; //Math.floor(5 - (this.piecesleft / 12));
		var move = this.ai.pickMove(depth, this.AIPiece, this.useABSearch);
		
		this.placePiece(move[0], move[1], this.AIPiece);
		this.aioutput = "Last Move: " + (move[0] + 1) + ", " + (move[1] + 1);
		
		if	(move[2] > 0) {
			if	(move[3] === "CW") {
				this.rotateQuadrant(move[2], "CW");
				this.aioutput = this.aioutput + ", Rot: Q" + move[2] + " CW";
			} else {
				this.rotateQuadrant(move[2], "CCW");
				this.aioutput = this.aioutput + ", Rot: Q" + move[2] + " CCW";		
			}
		} else {
			this.aioutput = this.aioutput + ", Rot: N/A";
		}
		
		this.stage = 0;
		
	}
	
	this.checkGoal();
	
}


// Check for victory.
GameEngine.prototype.checkGoal = function () {
	var state = this.gameboard.checkGoalState();
	//console.log("State returned : " + state);
	if	(state === 'max') {
		if	(this.playerPiece > 0) { this.stage = 4; }
		else { this.stage = 5; }
	} else if	(state === 'min') {
		if	(this.playerPiece > 0) { this.stage = 5; }
		else { this.stage = 4; }
	} else if	(state === 'tie' || this.piecesleft < 1) { this.stage = 6; }
	
	if	(state === 'nope') { return false; }
	else { return true; }
	
}


// ===================== 
//   DRAWING FUNCTIONS
// =====================


// Draws a representation of the game board on the canvas.
function drawBoard (engine, gameboard, startX, startY, scale) {
	var ctx = engine.ctx;	
	ctx.save();
	
	ctx.beginPath();
    ctx.fillStyle = "rgb(200, 200, 255)";
    ctx.fillRect(startX, startY, scale, scale);
	ctx.lineWidth = 8;
	ctx.strokeStyle="rgb(0, 0, 0)";
    ctx.rect(startX, startY, scale, scale);
    ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	ctx.lineWidth = 4;
	ctx.strokeStyle="rgb(255, 255, 255)";
    ctx.rect(startX, startY, scale, scale);
    ctx.stroke();
	ctx.closePath();
	
	var space = scale / 7;
	var radius = space / 3;
	ctx.lineWidth = 2;
	ctx.strokeStyle="rgb(0, 0, 0)";
	
	// Draw all the pieces, including the ghost piece the player can place at wherever their mouse is, if applicable.
	for	(var y = 0; y < 6; y++) {
		for	(var x = 0; x < 6; x++) {
			ctx.beginPath();
			var color = gameboard.board[y][x] * 120;
			ctx.fillStyle = "rgb(" + (128 + color) + ", " + (128 + color) + ", " + (128 + color) + ")";
			ctx.arc(startX + ((x + 1) * space), startY + ((y + 1) * space), radius, 0, 2 * Math.PI, false);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			
			// Draw a ghost piece if the player can place one in the current location.
			// To do this, it must be their turn, and also the location must be empty.
			if	(engine.stage === 0 && gameboard.board[y][x] === 0) {
				distance = Math.sqrt(Math.pow(engine.mouse_x - (startX + ((x + 1) * space)), 2) + Math.pow(engine.mouse_y - (startY + ((y + 1) * space)), 2));
				
				if	(distance < radius) {
					ctx.beginPath();
					ctx.fillStyle = "rgba(" + (128 + engine.playerPiece * 120) + ", "
										    + (128 + engine.playerPiece * 120) + ", "
										    + (128 + engine.playerPiece * 120) + ", 0.75)";
					ctx.arc(startX + ((x + 1) * space), startY + ((y + 1) * space), radius * 7 / 8, 0, 2 * Math.PI, false);
					ctx.fill();
					ctx.closePath();
					
					// Listen for mouse clicks here to let the player place a piece.
					if	(engine.mouseclick) {
						engine.stage = 1;
						engine.mouseclick = false;
						engine.placePiece(x, y, engine.playerPiece);
						engine.checkGoal();
						// console.log("Player Utility Value = " + engine.gameboard.utilityValue(engine.playerPiece));
						// console.log("Enemy Utility Value = " + engine.gameboard.utilityValue(engine.AIPiece));
					}
					
				}
				
			}
			
		}
		
	}
	
	
	// If this is the rotate quadrant part of the turn stage, and it is the player's turn, draw the buttons for rotating quadrants.
	if	(engine.stage === 1) {
		var width = space / 3;
		var length = scale / 4;
		var inset_width = (space - radius) / 2 - width / 2;
		var inset_length = space * 2 - length / 2;
		var final_x = 0;
		var final_y = 0;
		
		// Quadrant 1 - CW
		ctx.beginPath();
		final_x = startX + inset_length;
		final_y = startY + inset_width;
		if	(engine.mouse_x > final_x && engine.mouse_x < final_x + length &&
			 engine.mouse_y > final_y && engine.mouse_y < final_y + width) {
			ctx.fillStyle = "rgb(255, 255, 150)";
			if	(engine.mouseclick) {
				engine.stage = 2;
				engine.mouseclick = false;
				engine.aioutput = "Thinking...";
				engine.rotateQuadrant(1, "CW");
			}
		} else { ctx.fillStyle = "rgb(200, 255, 255)"; }
		ctx.fillRect(final_x, final_y, length, width);
		ctx.closePath();
		
		drawArrow(ctx,	startX + inset_length + 10,
						startY + inset_width + width / 2, 
						startX + inset_length + length - 10,
						startY + inset_width + width / 2);
		
		
		// Quadrant 1 - CCW
		ctx.beginPath();
		final_x = startX + inset_width;
		final_y = startY + inset_length;
		if	(engine.mouse_x > final_x && engine.mouse_x < final_x + width &&
			 engine.mouse_y > final_y && engine.mouse_y < final_y + length) {
			ctx.fillStyle = "rgb(255, 255, 150)";
			if	(engine.mouseclick) {
				engine.stage = 2;
				engine.mouseclick = false;
				engine.aioutput = "Thinking...";
				engine.rotateQuadrant(1, "CCW");
			}
		} else { ctx.fillStyle = "rgb(200, 255, 255)"; }
		ctx.fillRect(final_x, final_y, width, length);
		ctx.closePath();
		
		drawArrow(ctx,	startX + inset_width + width / 2,
						startY + inset_length + 10, 
						startX + inset_width + width / 2,
						startY + inset_length + length - 10);
		
		
		// Quadrant 2 - CW
		ctx.beginPath();
		final_x = startX + scale - inset_width - width;
		final_y = startY + inset_length;
		if	(engine.mouse_x > final_x && engine.mouse_x < final_x + width &&
			 engine.mouse_y > final_y && engine.mouse_y < final_y + length) {
			ctx.fillStyle = "rgb(255, 255, 150)";
			if	(engine.mouseclick) {
				engine.stage = 2;
				engine.mouseclick = false;
				engine.aioutput = "Thinking...";
				engine.rotateQuadrant(2, "CW");
			}
		} else { ctx.fillStyle = "rgb(200, 255, 255)"; }
		ctx.fillRect(final_x, final_y, width, length);
		ctx.closePath();
		
		drawArrow(ctx,	startX + scale - (inset_width + width / 2),
						startY + inset_length + 10, 
						startX + scale - (inset_width + width / 2),
						startY + inset_length + length - 10);
		
		
		// Quadrant 2 - CCW
		ctx.beginPath();
		final_x = startX + scale - inset_length - length;
		final_y = startY + inset_width;
		if	(engine.mouse_x > final_x && engine.mouse_x < final_x + length &&
			 engine.mouse_y > final_y && engine.mouse_y < final_y + width) {
			ctx.fillStyle = "rgb(255, 255, 150)";
			if	(engine.mouseclick) {
				engine.stage = 2;
				engine.mouseclick = false;
				engine.aioutput = "Thinking...";
				engine.rotateQuadrant(2, "CCW");
			}
		} else { ctx.fillStyle = "rgb(200, 255, 255)"; }
		ctx.fillRect(final_x, final_y, length, width);
		ctx.closePath();
		
		drawArrow(ctx,	startX + scale - (inset_length + 10),
						startY + inset_width + width / 2,
						startX + scale - (inset_length + length - 10),
						startY + inset_width + width / 2);	
		
		
		// Quadrant 3 - CW
		ctx.beginPath();
		final_x = startX + inset_width;
		final_y = startY + scale - inset_length - length;
		if	(engine.mouse_x > final_x && engine.mouse_x < final_x + width &&
			 engine.mouse_y > final_y && engine.mouse_y < final_y + length) {
			ctx.fillStyle = "rgb(255, 255, 150)";
			if	(engine.mouseclick) {
				engine.stage = 2;
				engine.mouseclick = false;
				engine.aioutput = "Thinking...";
				engine.rotateQuadrant(3, "CW");
			}
		} else { ctx.fillStyle = "rgb(200, 255, 255)"; }
		ctx.fillRect(final_x, final_y, width, length);
		ctx.closePath();
		
		drawArrow(ctx,	startX + inset_width + width / 2,
						startY + scale - (inset_length + 10), 
						startX + inset_width + width / 2,
						startY + scale - (inset_length + length - 10));
				
		
		// Quadrant 3 - CCW
		ctx.beginPath();
		final_x = startX + inset_length;
		final_y = startY + scale - inset_width - width;
		if	(engine.mouse_x > final_x && engine.mouse_x < final_x + length &&
			 engine.mouse_y > final_y && engine.mouse_y < final_y + width) {
			ctx.fillStyle = "rgb(255, 255, 150)";
			if	(engine.mouseclick) {
				engine.stage = 2;
				engine.mouseclick = false;
				engine.aioutput = "Thinking...";
				engine.rotateQuadrant(3, "CCW");
			}
		} else { ctx.fillStyle = "rgb(200, 255, 255)"; }
		ctx.fillRect(final_x, final_y, length, width);
		ctx.closePath();
		
		drawArrow(ctx,	startX + inset_length + 10,
						startY + scale - (inset_width + width / 2), 
						startX + inset_length + length - 10,
						startY + scale - (inset_width + width / 2));
						
		
		// Quadrant 4 - CW
		ctx.beginPath();
		final_x = startX + scale - inset_length - length;
		final_y = startY + scale - inset_width - width;
		if	(engine.mouse_x > final_x && engine.mouse_x < final_x + length &&
			 engine.mouse_y > final_y && engine.mouse_y < final_y + width) {
			ctx.fillStyle = "rgb(255, 255, 150)";
			if	(engine.mouseclick) {
				engine.stage = 2;
				engine.mouseclick = false;
				engine.aioutput = "Thinking...";
				engine.rotateQuadrant(4, "CW");
			}
		} else { ctx.fillStyle = "rgb(200, 255, 255)"; }
		ctx.fillRect(final_x, final_y, length, width);
		ctx.closePath();
		
		drawArrow(ctx,	startX + scale - (inset_length + 10),
						startY + scale - (inset_width + width / 2),
						startX + scale - (inset_length + length - 10),
						startY + scale - (inset_width + width / 2));		
		
		
		// Quadrant 4 - CCW
		ctx.beginPath();
		final_x = startX + scale - inset_width - width;
		final_y = startY + scale - inset_length - length;
		if	(engine.mouse_x > final_x && engine.mouse_x < final_x + width &&
			 engine.mouse_y > final_y && engine.mouse_y < final_y + length) {
			ctx.fillStyle = "rgb(255, 255, 150)";
			if	(engine.mouseclick) {
				engine.stage = 2;
				engine.mouseclick = false;
				engine.aioutput = "Thinking...";
				engine.rotateQuadrant(4, "CCW");
			}
		} else { ctx.fillStyle = "rgb(200, 255, 255)"; }
		ctx.fillRect(final_x, final_y, width, length);
		ctx.closePath();
		
		drawArrow(ctx,	startX + scale - (inset_width + width / 2),
						startY + scale - (inset_length + 10), 
						startX + scale - (inset_width + width / 2),
						startY + scale - (inset_length + length - 10));
						
		
		// Draw borders around all the buttons. These are kept separate to avoid beginning more paths than necessary.
		ctx.beginPath();
		ctx.strokeStyle="rgb(0, 0, 0)";
		ctx.lineWidth = 2;
		ctx.rect(startX + inset_length, startY + inset_width, length, width);
		ctx.stroke();
		ctx.rect(startX + inset_width, startY + inset_length, width, length);
		ctx.stroke();
		ctx.rect(startX + scale - inset_width - width, startY + inset_length, width, length);
		ctx.stroke();
		ctx.rect(startX + scale - inset_length - length, startY + inset_width, length, width);
		ctx.stroke();
		ctx.rect(startX + inset_width, startY + scale - inset_length - length, width, length);
		ctx.stroke();
		ctx.rect(startX + inset_length, startY + scale - inset_width - width, length, width);
		ctx.stroke();
		ctx.rect(startX + scale - inset_length - length, startY + scale - inset_width - width, length, width);
		ctx.stroke();
		ctx.rect(startX + scale - inset_width - width, startY + scale - inset_length - length, width, length);
		ctx.stroke();
		ctx.closePath();		
		
	}
	
	ctx.restore();
	
}

// Draws an arrow beginning at the start coordinates and pointing towards the end coordinates.
function drawArrow (ctx, startX, startY, endX, endY) {
	var angle = Math.atan2(startY - endY, startX - endX);
	var angleCW = angle - Math.PI / 4;
	var angleCCW = angle + Math.PI / 4;
	
	ctx.save();
	ctx.beginPath();
	ctx.strokeStyle="rgb(0, 0, 0)";
	ctx.lineWidth = 4;
	ctx.moveTo(startX, startY);
	ctx.lineTo(endX + 5 * Math.cos(angle), endY + 5 * Math.sin(angle));
	ctx.stroke();
	ctx.closePath();
	
	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.fillStyle="rgb(0, 0, 0)";
	ctx.moveTo(endX, endY);
	ctx.lineTo(endX + 12 * Math.cos(angleCW), endY + 12 * Math.sin(angleCW));
	ctx.lineTo(endX + 12 * Math.cos(angleCCW), endY + 12 * Math.sin(angleCCW));	
	ctx.fill();
	ctx.closePath();
	ctx.restore();
	
}


// Draws buttons.
function drawButtons (engine, startX, startY, width, height) {
	var ctx = engine.ctx;	
	ctx.save();
	
	// Draw the frame.
	ctx.beginPath();
    ctx.fillStyle = "rgb(32, 32, 32)";
    ctx.fillRect(startX, startY, width, height);
	ctx.lineWidth = 8;
	ctx.strokeStyle="rgb(128, 128, 128)";
    ctx.rect(startX, startY, width, height);
    ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	ctx.lineWidth = 4;
	ctx.strokeStyle="rgb(64, 64, 64)";
    ctx.rect(startX, startY, width, height);
    ctx.stroke();
	ctx.closePath();
	
	
	ctx.beginPath();
	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.font = "bold 20px Times New Roman";
	ctx.fillText("~ AI Status ~", startX + 32, startY + 40);
	ctx.closePath();
	
	ctx.beginPath();
	ctx.font = "bold 12px Times New Roman";
	ctx.fillText(engine.aioutput, startX + 10, startY + 75);
	ctx.closePath();
	
	
	if	(engine.stage === 4) {
		ctx.beginPath();
		ctx.font = "bold 18px Times New Roman";
		ctx.fillText("VICTORY", startX + 10, startY + 120);
		ctx.closePath();
	} else if (engine.stage === 5) {
		ctx.beginPath();
		ctx.font = "bold 18px Times New Roman";
		ctx.fillText("DEFEAT", startX + 10, startY + 120);
		ctx.closePath();
	} else if (engine.stage === 6) {
		ctx.beginPath();
		ctx.font = "bold 18px Times New Roman";
		ctx.fillText("TIE", startX + 10, startY + 120);
		ctx.closePath();
	}
	
	
	// Draw the "Abstain from Rotating a Quadrant" Button
	ctx.beginPath();
	if	(engine.stage === 1) {
		if	(engine.mouse_x > startX + 10 && engine.mouse_x < startX + width - 10 &&
			 engine.mouse_y > startY + height - width + 10 && engine.mouse_y < startY + height - 10) {
			ctx.fillStyle = "rgb(255, 255, 150)";
			if	(engine.mouseclick) {
				engine.mouseclick = false;
				engine.aioutput = "Thinking...";
				engine.stage = 3;
				engine.AITurn();
			}
		} else {
			ctx.fillStyle = "rgb(200, 255, 200)";
		}
	} else {
		ctx.fillStyle = "rgb(128, 128, 128)";
	}
    ctx.fillRect(startX + 10, startY + height - width + 10, width - 20, width - 20);
	ctx.lineWidth = 8;
	ctx.strokeStyle="rgb(0, 0, 0)";
    ctx.rect(startX + 10, startY + height - width + 10, width - 20, width - 20);
    ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	ctx.lineWidth = 4;
	ctx.strokeStyle="rgb(200, 200, 200)";
    ctx.rect(startX + 10, startY + height - width + 10, width - 20, width - 20);
    ctx.stroke();
	ctx.closePath();
	
	ctx.beginPath();
	if	(engine.stage === 1) { ctx.fillStyle = "rgb(0, 0, 0)"; }
	else { ctx.fillStyle = "rgb(160, 160, 160)"; }
	ctx.font = "bold 24px Times New Roman";
	ctx.fillText("SKIP", startX + 58, startY + height - width / 2 - 10);
	ctx.fillText("ROTATION", startX + 27, startY + height - width / 2 + 20);
	ctx.closePath();
	
	// Draw the "Switch Colors" Button
	ctx.beginPath();
	if	(engine.mouse_x > startX + 10 && engine.mouse_x < startX + width - 10 &&
		 engine.mouse_y > startY + height - (width * 2) + 10 && engine.mouse_y < startY + height - width - 10) {
		ctx.fillStyle = "rgb(255, 255, 150)";
		if	(engine.mouseclick) {
			engine.mouseclick = false;
			console.log("Click");
			var temp = engine.playerPiece;
			engine.playerPiece = engine.AIPiece;
			engine.AIPiece = temp;
			console.log("Player Utility Value = " + engine.gameboard.utilityValue(1));
			console.log("Enemy Utility Value = " + engine.gameboard.utilityValue(-1));
		}
	} else {
		ctx.fillStyle = "rgb(200, 255, 200)";
	}
    ctx.fillRect(startX + 10, startY + height - (width * 2) + 10, width - 20, width - 20);
	ctx.lineWidth = 8;
	ctx.strokeStyle="rgb(0, 0, 0)";
    ctx.rect(startX + 10, startY + height - (width * 2) + 10, width - 20, width - 20);
    ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	ctx.lineWidth = 4;
	ctx.strokeStyle="rgb(200, 200, 200)";
    ctx.rect(startX + 10, startY + height - (width * 2) + 10, width - 20, width - 20);
    ctx.stroke();
	ctx.closePath();
	
	ctx.beginPath();
	if	(engine.stage === 1) { ctx.fillStyle = "rgb(0, 0, 0)"; }
	else { ctx.fillStyle = "rgb(0,0,0)"; }
	ctx.font = "bold 24px Times New Roman";
	ctx.fillText("SWITCH", startX + 40, startY - width + height - width / 2 - 10);
	ctx.fillText("COLORS", startX + 39, startY + height - width - width / 2 + 20);
	ctx.closePath();
	
	
	ctx.restore();
	
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
}

function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}