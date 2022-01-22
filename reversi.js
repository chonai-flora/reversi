const CANVAS = 720;
const BLOCK = CANVAS / 8;

let board;
let turn;
let gameEnds;
let boardChanged;

let isFlipping;
let flipAngle;
let flippingDisks;

const isOutOfRange = (w, h) => (w < 0 || h < 0 || w >= 8 || h >= 8);

function setup() {
	createCanvas(CANVAS, CANVAS + BLOCK);
	strokeWeight(2);
	angleMode(DEGREES);

	board = Array(8).fill(0).map(() => Array(8).fill(0));
	board[3][3] = board[4][4] = +1;
	board[3][4] = board[4][3] = -1;
	turn = +1;
	boardChanged = false;

	isFlipping = false;
	flipAngle = 0;
	flippingDisks = [];
}

function draw() {
	background('olivedrab');

	let flipped = false;
	gameEnds = flipAngle === 0 && !isFlipping;
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			let x = i * BLOCK;
			let y = (j + 1) * BLOCK;
			let ratio = 1;
			noFill();
			stroke('black');
			square(x, y, BLOCK);
			if (board[j][i] === 0) {
				gameEnds = false;
				continue;
			}
			if (flippingDisks.includes(i + "" + j)) {
				ratio = cos(flipAngle);
				if (flipAngle === 90) board[j][i] = turn;
				if (!flipped) {
					flipAngle += 9;
					flipped = true;
				}
				if (flipAngle === 180) {
					isFlipping = false;
					flipAngle = 0;
					flippingDisks = [];
					turn = -turn;

					for (let k = 0; k < 8; k++) {
						for (let l = 0; l < 8; l++) {
							if (board[l][k] === 0) {
								updateBoard(k, l, false);
								if (boardChanged) k = l = 8;
							}
						}
					}
					if (!boardChanged) turn = -turn;
				}
			}
			fill(board[j][i] === +1 ? 'white' : 'black');
			noStroke();
			ellipse(
				x + BLOCK / 2,
				y + BLOCK / 2,
				ratio * (BLOCK - 25),
				BLOCK - 25
			);
		}
	}
	if (!board.flat().includes(+1) ||
		!board.flat().includes(-1)) {
		gameEnds = true;
	}

	textSize(48);
	textAlign(LEFT, TOP);
	fill('white');
	noStroke();
	rect(0, 0, CANVAS, BLOCK);
	fill('black');
	if (gameEnds) {
		let total = board.flat().reduce(
			(sum, element) => sum + element, false
		);
		if (total === 0) {
			text("引き分けです", 0, 24);
		}
		else {
			let diff = abs(total);
			text(diff + "枚差で　の勝利です", 0, 24);
			fill(total > 0 ? 'white' : 'black');
			stroke('black');
			circle(diff < 10 ? 198 : 226, 50, 36);
		}
		return;
	}
	text("のターンです", 48, 24);
	fill(turn === +1 ? 'white' : 'black');
	stroke('black');
	circle(24, 50, 36);
}

function updateBoard(w, h, flip = true) {
	boardChanged = false;
	for (let i = 0; i < 360; i += 45) {
		let flippables = [];
		for (let j = 1; j < floor(8 * sqrt(2)); j++) {
			let p = j * round(cos(i)) + w;
			let q = j * round(sin(i)) + h;

			if (isOutOfRange(p, q) || board[q][p] === 0) {
				flippables = [];
				break;
			}
			else if (board[q][p] === turn) break;
			flippables.push(p + "" + q);
		}

		for (let flippable of flippables) {
			if (flip) {
				flippingDisks.push(flippable);
			}
			boardChanged = true;
		}
	}
}

function mousePressed() {
	let p = floor(mouseX / BLOCK);
	let q = floor(mouseY / BLOCK) - 1;

	if (gameEnds || isOutOfRange(p, q) ||
		board[q][p] !== 0 || isFlipping) return;

	updateBoard(p, q);
	if (boardChanged) {
		board[q][p] = turn;
		isFlipping = true;
	}
}