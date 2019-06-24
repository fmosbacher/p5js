const snakeInitialSize = 3;
const populationsSize = 121;
let bestScores;
let snakeStep;
let games;
let snake;
let fruit;
let score;
let direction;
let generation;

function setup() {
	createCanvas(700, 700);
	// frameRate(60);
	tf.setBackend('cpu');

	snakeStep = floor(width / 20);
	games = [];
	bestScores = [0];
	generation = 0;
	
	for (let i = 0; i < populationsSize; i++) {
		games.push({
			model: getNewModel(),
			snake: getNewSnake(),
			fruit: { },
			score: 0,
			direction: 'right',
			isFinished: false,
			stepsWithNoScore: 0
		});
	}
}

function draw() {
	background(255);

	if (games.filter(game => !game.isFinished).length === 0) {
		const gamesCopy = Object.assign([], games);
		
		generation += 1;
		games = [];
		gamesCopy.sort((a, b) => b.score - a.score);
		
		console.log(`Generation: ${generation}, best score: ${gamesCopy[0].score}`);
		bestScores.push(gamesCopy[0].score);

		let totalScore = 0;
		let accumulatedScores = [];

		for (let i = 0; i < gamesCopy.length; i++) {
			totalScore += gamesCopy[i].score;
			accumulatedScores.push(totalScore);
		}

		accumulatedScores = accumulatedScores.map(accScore => accScore / totalScore);

		for (let i = 0; i < gamesCopy.length; i++) {
			const randomValue = random();
			let index = 0;

			while (randomValue > accumulatedScores[index]) {
				index += 1;
			}

			const weights = gamesCopy[index].model.getWeights();
			const randomRate = 0.2;
			let newWeights = [];

			for (let j = 0; j < weights.length; j++) {
				const shape = weights[j].shape;
				const values = weights[j].dataSync().slice();
				for (let k = 0; k < values.length; k++) {
					if (random() < randomRate) {
						values[k] += randomGaussian();
					}
				}
				newWeights.push(tf.tensor(values, shape));
			}

			games.push({
				model: getNewModel(newWeights),
				snake: getNewSnake(),
				fruit: {},
				score: 0,
				direction: 'right',
				isFinished: false,
				stepsWithNoScore: 0
			});
		}
	}
	
	for (let i = 0; i < games.length; i++) {
		if (!games[i].isFinished) {
			if (Object.keys(games[i].fruit).length === 0) {
				updateFruitPosition(games[i]);
			}
			predictDirection(games[i]);
			updateSnakePosition(games[i]);
			checkCollisions(games[i]);
			updateScore(games[i]);
		}
	}
	
	renderGames();
}

function predictDirection(game) {
	const outputs = game.model.predict(getState(game)).arraySync();
	const sortedOutputs = outputs[0]
		.map((value, index) => ({ value, index }))
		.sort((a, b) => b.value - a.value);

	if (sortedOutputs[0].index === 0) {
		game.direction = 'up';
	} else if (sortedOutputs[0].index === 1) {
		game.direction = 'down';
	} else if (sortedOutputs[0].index === 2) {
		game.direction = 'right';
	} else if (sortedOutputs[0].index === 3) {
		game.direction = 'left';
	}
}

function getState(game) {
	const snakeHead = game.snake[game.snake.length - 1];
	const isUpBlocked = game.snake
		.filter(part => part.y === snakeHead.y - snakeStep && part.x === snakeHead.x).length > 0 ||
		snakeHead.y - snakeStep <= 0;
	const isRightBlocked = game.snake
		.filter(part => part.x === snakeHead.x + snakeStep && part.y === snakeHead.y).length > 0 ||
		snakeHead.x + snakeStep >= width;
	const isDownBlocked = game.snake
		.filter(part => part.y === snakeHead.y + snakeStep && part.x === snakeHead.x).length > 0 ||
		snakeHead.y + snakeStep >= height;
	const isLeftBlocked = game.snake
		.filter(part => part.x === snakeHead.x - snakeStep && part.y === snakeHead.y).length > 0 ||
		snakeHead.x - snakeStep <= 0;
	const isFruitUp = snakeHead.y > game.fruit.y;
	const isFruitRight = snakeHead.x < game.fruit.x;
	const isFruitDown = snakeHead.y < game.fruit.y;
	const isFruitLeft = snakeHead.x > game.fruit.x;

	return tf.tensor([[
		isUpBlocked, isRightBlocked, isDownBlocked, isLeftBlocked,
		isFruitUp, isFruitRight, isFruitDown, isFruitLeft
	]]);
}

function checkCollisions(game) {
	const { snake } = game;
	const { x, y } = snake[snake.length - 1];
	const xOut = x < snakeStep || x > width - snakeStep;
	const yOut = y < snakeStep || y > height - snakeStep;
	let isDead = false;

	if (xOut || yOut) {
		isDead = true;
	}

	for (let i = 0; i < snake.length - 1; i++) {
		if (x === snake[i].x && y === snake[i].y) {
			isDead = true;
		}
	}

	if (isDead) {
		game.isFinished = true;
	}
}

function updateScore(game) {
	const { snake, fruit } = game;
	const { x, y } = snake[snake.length - 1];

	if (x === fruit.x && y === fruit.y) {
		snake.unshift({
			x: snake[0].x,
			y: snake[0].y
		});
		game.fruit = {};
		game.score += 1;
		game.stepsWithNoScore = 0;
	} else {
		game.stepsWithNoScore += 1;
	}
}

function updateSnakePosition(game) {
	const { snake, direction } = game;

	if (game.stepsWithNoScore > 300) {
		game.isFinished = true;
	}

	for (let i = 0; i < snake.length - 1; i++) {
		snake[i] = {
			x: snake[i + 1].x,
			y: snake[i + 1].y
		};
	}

	let { x, y } = snake[snake.length - 2];

	if (direction === 'up') {
		y -= snakeStep;
	}
	if (direction === 'down') {
		y += snakeStep;
	}
	if (direction === 'right') {
		x += snakeStep;
	}
	if (direction === 'left') {
		x -= snakeStep;
	}

	snake[snake.length - 1] = { x, y };
}

function updateFruitPosition(game) {
	let x, y;

	do {
		const wRandom = random(snakeStep, width - snakeStep);
		const hRandom = random(snakeStep, height - snakeStep);
		x = wRandom - wRandom % snakeStep;
		y = hRandom - hRandom % snakeStep;
		game.fruit = { x, y };
	} while (game.snake.filter(part => part.x === x && part.y === y).length > 0);
}

function getNewModel(weights) {
	let model;

	tf.tidy(() => {
		model = tf.sequential({
			layers: [
				tf.layers.dense({
					inputShape: [8],
					units: 8,
					useBias: true
				}),
				tf.layers.dense({
					units: 4,
					useBias: true
				})
			]
		});
	});

	if (weights) {
		model.setWeights(weights);
	}

	return model;
}

function getNewSnake() {
	let newSnake = [];
	
	for (let i = 0; i < snakeInitialSize; i++) {
		newSnake.push({
			x: (i + 1) * snakeStep,
			y: snakeStep * 5
		});
	}

	return newSnake;
}

function renderGames() {
	const gridSize = ceil(sqrt(games.length));
	const rowSize = height / ceil(sqrt(games.length));
	const colSize = width / ceil(sqrt(games.length));
	const gamesMatrix = reshapeColumns(games, ceil(sqrt(games.length)));
	
	strokeWeight(3);

	for (let i = 0; i < gamesMatrix.length; i++) {
		for (let j = 0; j < gamesMatrix[i].length; j++) {
			if (!gamesMatrix[i][j].isFinished) {
				const { snake, fruit } = gamesMatrix[i][j];

				for (let k = 0; k < snake.length - 1; k++) {
					const colorStep = 200 / snake.length;
					stroke(0, 260 - (k + 1) * colorStep, 0);
					line(
						snake[k].x / gridSize + rowSize * j,
						snake[k].y / gridSize + colSize * i,
						snake[k + 1].x / gridSize + rowSize * j,
						snake[k + 1].y / gridSize + colSize * i
					);

					stroke(0);
				}

				stroke('red');

				point(
					fruit.x / gridSize + rowSize * j,
					fruit.y / gridSize + colSize * i
				);
			}
		}
	}
	
	stroke('rgba(0, 0, 0, 0.5)');
	strokeWeight(0.5);

	for (let i = colSize; i <= width - colSize; i += colSize) {
		line(i, 0, i, height);
	}

	for (let i = rowSize; i <= height - rowSize; i += rowSize) {
		line(0, i, width, i);
	}

	const xStepSize = width / (bestScores.length - 1);
	const maxScore = bestScores.slice().sort((a, b) => b - a)[0];

	strokeWeight(12);
	stroke('rgba(255, 255, 0, 0.2)');

	for (let i = 0; i < bestScores.length - 1; i++) {
		line(
			i * xStepSize,
			height - height * bestScores[i] / maxScore,
			(i + 1) * xStepSize,
			height - height * bestScores[i + 1] / maxScore
		);
	}
}

function reshapeColumns(arr, cols) {
	arr = arr.slice();
	let matrix = [];

	while (arr.length) {
		matrix.push(arr.splice(0, cols))
	}

	return matrix;
}