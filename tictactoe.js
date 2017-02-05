var game;
document.addEventListener("DOMContentLoaded", function (e) {
	function Game (playerStart) {
		var self = this;
		self.canvas = document.getElementById("canvas");
		self.canvas.addEventListener("click", onMouseClick)
		self.ctx = canvas.getContext("2d");
		self.started = false;
		self.currentPlayer = "O";
				
		self.reset = reset;
		self.drawX = drawX;
		self.drawO = drawO;
		self.saveGame = saveGame;
		self.loadGame = loadGame;

		var boardSize = 3;
		var fields = new Array(boardSize * boardSize).fill("_");
		var ratio = 0.7;
		var gameOver = false;
		var tie = "TIE";
				
		return self;
		
		function reset () {
			self.started = false;
			self.currentPlayer = "O";
			fields.fill("_");
			
			gameOver = false;
			
			var width = self.canvas.width;
			var height = self.canvas.height;
			
			self.ctx.setTransform(1,0,0,1,0,0);
			self.ctx.clearRect(0,0,width,height);
			self.ctx.strokeStyle = "red";
			self.ctx.lineWidth = 5;
			self.ctx.strokeRect(0,0,width,height);
			
			self.ctx.beginPath();
			for(var i = 1; i <= boardSize; i++) {
				self.ctx.moveTo(i*width/boardSize,0);
				self.ctx.lineTo(i*width/boardSize, height);
				self.ctx.moveTo(0,i*height/boardSize);
				self.ctx.lineTo(width, i*height/boardSize);
			}
			
			self.ctx.stroke();
		}
				
		function drawX (params) {
			self.ctx.moveTo(params.cellX + (1-ratio)/2*params.cellWidth, params.cellY + (1-ratio)/2*params.cellHeight);
			self.ctx.lineTo(params.cellX + params.cellWidth*(1 + ratio)/2, params.cellY + params.cellHeight*(1 + ratio)/2);
			self.ctx.moveTo(params.cellX + (1-ratio)/2*params.cellWidth, params.cellY + params.cellHeight*(1 + ratio)/2);
			self.ctx.lineTo(params.cellX + params.cellWidth*(1 + ratio)/2, params.cellY + (1-ratio)/2*params.cellHeight);
			self.ctx.stroke();
		}
		
		function drawO (params) {
			self.ctx.beginPath();
			self.ctx.arc(params.cellX + params.cellWidth/2,
				params.cellY + params.cellHeight/2,
				ratio * Math.min(params.cellWidth,
				params.cellHeight) / 2, 0,
				Math.PI*2,
				false);
			self.ctx.stroke();
		}
		
		function draw(cell, player) {
			var field = parseInt(cell);
			if(isNaN(field) || field < 0 || field >= fields.length) {
				return;
			}
			
			fields[field] = player;
			
			var params = {
				cellWidth: this.canvas.width / boardSize,
				cellHeight: this.canvas.height / boardSize,
				cellX: field % boardSize * (this.canvas.width / boardSize),
				cellY: Math.floor(field/boardSize) * (this.canvas.height / boardSize)
			};
			
			if(player === "O") {
				drawO(params);
			} else if(player === "X") {
				drawX(params);
			}
			
			return;
		}
		
		function onMouseClick(event){
			if(!self.started) {
				self.started = true;
			}
			
			var totalOffsetX = 0;
			var totalOffsetY = 0;
			var canvasX = 0;
			var canvasY = 0;
			var currentElement = this;

			do{
				totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
				totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
			}
			while(currentElement = currentElement.offsetParent)

			canvasX = event.pageX - totalOffsetX;
			canvasY = event.pageY - totalOffsetY;
			
			var boardX = Math.ceil(canvasX / (this.width / boardSize)) - 1;
			var boardY = Math.ceil(canvasY / (this.height / boardSize)) - 1;
			
			var cell = boardX + boardSize * boardY;
			if(fields[cell] ===  "_") {
				advance(cell);
			}
		}
		
		function advance(cell) {
			fields[cell] = self.currentPlayer;
			draw(cell, self.currentPlayer);
			
			var win = checkGame(self.currentPlayer);
			if(self.currentPlayer === win) {
				gameWon();
				gameOver = true;
			} else if(tie === win) {
				gameTie	();
				gameOver = true;
			} else if(self.currentPlayer === "O") {
				self.currentPlayer = "X";
				makeAITurn();
			}
		}
		
		function makeAITurn() {
			var availableFields = [];
			for(var i = 0; i < fields.length; i++) {
				if(fields[i] === "_") {
					availableFields.push(i);
				}
			}
			
			var cell = parseInt(Math.random() * availableFields.length);
			
			draw(availableFields[cell], self.currentPlayer);
			
			var lose = self.currentPlayer === checkGame(self.currentPlayer);
			if(lose === self.currentPlayer) {
				gameLost();
				gameOver = true;
			} else if( lose === tie) {
				gameTie();
				gameOver = true;
			}
			
			self.currentPlayer = "O";
		}
		
		function checkGame(player) {
			var diag1 = fields
				.filter((a,x) => x % (boardSize + 1) === 0)
				.reduce((a,b) => a && b === player, true);
				
			if(diag1) {
				return player;
			}
			
			var diag2 = fields
				.filter((a,x) => x % boardSize  + Math.floor(x/boardSize) === boardSize - 1)
				.reduce((a,b) => a && b === player, true);
			
			if(diag2) {
				return player;
			}

			for(var i = 0; i < boardSize; i++) {
				var column = fields
					.filter((a,x) => x % boardSize === i)
					.reduce((a,b) => a === b ? a : false, player);
					
				if(column) {
					return player;
				}
				
				var row = fields
					.filter((a,x) => Math.floor(x / boardSize) === i)
					.reduce((a,b) => a && a === b ? a : false, player);
					
				if(row) {
					return player;				
				}
			}
			
			if(fields.filter(a => a === "_").length === 0) {
				return tie;
			}
			
			return "";
		}
		
		function saveGame() {
			localStorage.tictactoe = JSON.stringify(getGameState());
		}
		
		function loadGame() {
			self.reset();
			if(localStorage.tictactoe) {
				var state = JSON.parse(localStorage.tictactoe);
				if(!state.gameOver) {
					self.currentPlayer = state.currentPlayer;
					fields = state.fields;
					for(var i = 0; i < fields.length; i++) {
						if(i !== "_") {
							draw(i, fields[i]);
						}
					}
				}
			}
		}
		
		function getGameState() {
			return {
				fields: fields,
				currentPlayer: self.currentPlayer,
				gameOver: gameOver
				
			};
		}
		
		function gameWon() {
			if(confirm("You won! Start a new game?")) {
				self.reset();
			}
		}
		
		function gameLost() {
			if(confirm("You lost! Start a new game?")) {
				self.reset();
			}
		}
		
		function gameTie() {
			if(confirm("It's a tie! Start a new game?")) {
				self.reset();
			}
		}
	}
	
	game = new Game();
	game.loadGame();
	window.onbeforeunload = game.saveGame;
	
});