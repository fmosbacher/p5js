let board;

function setup() {
	createCanvas(720, 720);
	board = new Board(120);
}

function draw() {
	frameRate(8);
	board.step();
	board.draw();
}

function mouseClicked() {
	board.step();
}

class Board {

	constructor(size) {
		this.size = size;
		this.schema = this.createSchema();
	}

	createSchema() {
		const cellSize = width / this.size;
		const schema = [];

		for (let i = 0; i < this.size; i++) {
			schema[i] = [];
			for (let j = 0; j < this.size; j++) {
				const randomType = floor(random(0, 100));
				const humanPercent = 1;
				const zombiePercent = 1;
				// The rest is empty
				let cellType;

				if (randomType < humanPercent) {
					cellType = 'human';
				} else if (randomType < humanPercent + zombiePercent) {
					cellType = 'zombie';
				} else {
					cellType = 'empty';
				}

				schema[i][j] = {
					pos: createVector(j * cellSize, i * cellSize),
					size: cellSize,
					type: cellType
				};
			}
		}

		return schema;
	}

	step() {
		let auxSchema = [];
		
		this.schema.forEach((line, i) => {
			line.forEach((cell, j) => {
				let zombies = 0;
				let humans = 0;
				for (let k = i - 1; k <= i + 1; k++) {
					if (!auxSchema[i]) {
						auxSchema[i] = [];
					}
					for (let l = j - 1; l <= j + 1; l++) {
						if (k >= 0 && k < this.size && l >= 0 && l < this.size && (k !== i || l !== j)) {
							if (this.schema[k][l].type === 'zombie') {
								zombies += 1;
							} else if (this.schema[k][l].type === 'human') {
								humans += 1;
							}
						}
					}
				}

				auxSchema[i][j] = {
					pos: cell.pos,
					size: cell.size
				};

				if (cell.type === 'human') {
					if (zombies >= 1) {
						auxSchema[i][j].type = 'zombie';
					} else {
						auxSchema[i][j].type = 'human';
					}
				} else if (cell.type === 'zombie') {
					if (humans >= 2 || humans === 0) {
						auxSchema[i][j].type = 'empty';
					} else {
						auxSchema[i][j].type = 'zombie';
					}
				} else if (cell.type === 'empty') {
					if (humans === 2) {
						auxSchema[i][j].type = 'human';
					} else {
						auxSchema[i][j].type = 'empty';
					}
				}
 			});
		});

		this.schema = auxSchema;
	}

	draw() {
		this.schema.forEach(line => {
			line.forEach(cell => {
				if (cell.type === 'human') {
					fill('green');
				} else if (cell.type === 'zombie') {
					fill('red');
				} else {
					fill('white');
				}				
				noStroke();
				rect(cell.pos.x, cell.pos.y, cell.size, cell.size);
			});
		});
	}

}