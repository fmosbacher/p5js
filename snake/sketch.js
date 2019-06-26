const snakeInitialSize = 3;
const populationsSize = 100;
const mutationRate = 0.03;
let bestScores;
let snakeStep;
let games;
let score;
let generation;
let cycles;

function setup() {
	createCanvas(700, 700);
	// frameRate(10);
	tf.setBackend('cpu');

	snakeStep = floor(width / 20);
	games = [];
	bestScores = [0];
	generation = 0;
	cycles = [Date.now()];	
	for (let i = 0; i < populationsSize; i++) {
		games.push(createGame());
	}
}

function draw() {
	background(255);
	
	// Genetic Algorithm Evolution
	if (allGamesAreFinished()) {
		const selectionPool = createSelectionPool();
		const bestScore = games.slice().sort((a, b) => b.score - a.score)[0].score;

		bestScores.push(bestScore);
		generation += 1;
		games = [];
		
		cycles.push(Date.now());
		timeDiff = cycles[cycles.length - 1] - cycles[cycles.length - 2];
		const min = round(timeDiff / (1000 * 60));
		timeDiff -= min * 1000 * 60;
		const sec = round(timeDiff / 1000);

		for (let i = 0; i < populationsSize; i++) {
			const selectedIndividuals = selectIndividuals(selectionPool, 2);
			const newIndividual = crossover(selectedIndividuals[0], selectedIndividuals[1]);
			games.push(mutate(newIndividual));
		}

		console.log(`Generation: ${generation}, best score: ${bestScore}, cycle: ${min}m ${sec}s`);
	}

	// Main Loop
	for (let i = 0; i < games.length; i++) {
		if (!games[i].isFinished) {
			if (!fruitExists(games[i].fruit)) {
				games[i].fruit = createFruit(games[i].snake);
			}
			games[i].direction = predictDirection(games[i].model, games[i].snake, games[i].fruit);
			updateSnakePosition(games[i].snake, games[i].direction);
			games[i].isFinished = checkCollisions(games[i].snake);
			
			const scored = checkForFruit(games[i].snake, games[i].fruit);
			
			if (scored) {
				games[i].snake.unshift({
					x: games[i].snake[0].x,
					y: games[i].snake[0].y
				});
				games[i].fruit = {};
				games[i].score += 1;
				games[i].stepsWithNoScore = 0;
			} else {
				games[i].stepsWithNoScore += 1;
			}
			
			if (games[i].stepsWithNoScore > 300) {
				games[i].isFinished = true;
			}
		}
	}
	
	render();
}

function createGame(weights) {
	return {
		model: createModel(weights),
		snake: getNewSnake(),
		fruit: {},
		score: 0,
		direction: 'right',
		isFinished: false,
		stepsWithNoScore: 0
	};
}

function fruitExists(fruit) {
	return Object.keys(fruit).length > 0;
}

function allGamesAreFinished() {
	return games.filter(game => !game.isFinished).length === 0;
}

function createSelectionPool() {
	const gamesCopy = games.slice();
	const scoreSum = gamesCopy.map(game => game.score).reduce((acc, value) => acc + value);
	let selectionPool = [];

	if (scoreSum > 0) {
		for (let i = 0; i < populationsSize; i++) {
			const timesInPool = round(gamesCopy[i].score * 100 / scoreSum);
			for (let j = 0; j < timesInPool; j++) {
				const weights = gamesCopy[i].model.getWeights();
				selectionPool.push(createGame(weights));
			}
		}
	} else {
		for (let i = 0; i < populationsSize; i++) {
			const weights = random(gamesCopy).model.getWeights();
			selectionPool.push(createGame(weights));
		}
	}

	return selectionPool;
}

function selectIndividuals(selectionPool, numIndividuals) {
	let individuals = [];

	for (let i = 0; i < numIndividuals; i++) {
		const selectedIndividual = random(selectionPool);
		const weights = selectedIndividual.model.getWeights();
		individuals.push(createGame(weights));
	}

	return individuals;
}

function crossover(a, b) {
	const aWeights = a.model.getWeights();
	const bWeights = b.model.getWeights();
	const cutIndex = floor(random(0, aWeights.length));
	let newWeights = [];

	for (let i = 0; i < aWeights.length; i++) {
		if (i < cutIndex) {
			newWeights.push(aWeights[i].clone());
		} else {
			newWeights.push(bWeights[i].clone());
		}
	}

	// for (let i = 0; i < aWeights.length; i++) {
	// 	const shape = aWeights[i].shape;
	// 	const aValues = aWeights[i].dataSync().slice();
	// 	const bValues = bWeights[i].dataSync().slice();
	// 	const cutIndex = floor(random(0, aValues.length));
	// 	let newValues = [];

	// 	for (let j = 0; j < aValues.length; j++) {
	// 		if (j < cutIndex) {
	// 			newValues.push(aValues[j]);
	// 		} else {
	// 			newValues.push(bValues[j]);
	// 		}
	// 	}

	// 	newWeights.push(tf.tensor(newValues, shape));
	// }

	return createGame(newWeights);
}

function mutate(individual) {
	const weights = individual.model.getWeights();
	let newWeights = [];

	for (let i = 0; i < weights.length; i++) {
		const shape = weights[i].shape;
		const values = weights[i].dataSync().slice();
		
		for (let j = 0; j < values.length; j++) {
			if (random() < mutationRate) {
				values[j] += randomGaussian();
			}
		}
		
		newWeights.push(tf.tensor(values, shape));
	}

	return createGame(newWeights);
}

function predictDirection(model, snake, fruit) {
	const outputs = model.predict(getState(snake, fruit)).arraySync();
	const sortedOutputs = outputs[0]
		.map((value, index) => ({ value, index }))
		.sort((a, b) => b.value - a.value);

	if (sortedOutputs[0].index === 0) {
		return 'up';
	} else if (sortedOutputs[0].index === 1) {
		return 'down';
	} else if (sortedOutputs[0].index === 2) {
		return 'right';
	} else if (sortedOutputs[0].index === 3) {
		return 'left';
	}
}

function getState(snake, fruit) {
	const snakeHead = snake[snake.length - 1];
	const isUpBlocked = snake
		.filter(part => part.y === snakeHead.y - snakeStep && part.x === snakeHead.x).length > 0 ||
		snakeHead.y - snakeStep <= 0;
	const isRightBlocked = snake
		.filter(part => part.x === snakeHead.x + snakeStep && part.y === snakeHead.y).length > 0 ||
		snakeHead.x + snakeStep >= width;
	const isDownBlocked = snake
		.filter(part => part.y === snakeHead.y + snakeStep && part.x === snakeHead.x).length > 0 ||
		snakeHead.y + snakeStep >= height;
	const isLeftBlocked = snake
		.filter(part => part.x === snakeHead.x - snakeStep && part.y === snakeHead.y).length > 0 ||
		snakeHead.x - snakeStep <= 0;
	const isFruitUp = snakeHead.y > fruit.y;
	const isFruitRight = snakeHead.x < fruit.x;
	const isFruitDown = snakeHead.y < fruit.y;
	const isFruitLeft = snakeHead.x > fruit.x;

	return tf.tensor([[
		isUpBlocked, isRightBlocked, isDownBlocked, isLeftBlocked,
		isFruitUp, isFruitRight, isFruitDown, isFruitLeft
	]]);
}

function checkCollisions(snake) {
	const { x, y } = snake[snake.length - 1];
	const xOut = x < snakeStep || x > width - snakeStep;
	const yOut = y < snakeStep || y > height - snakeStep;
	let isFinished = false;

	if (xOut || yOut) {
		isFinished = true;
	}

	for (let i = 0; i < snake.length - 1; i++) {
		if (x === snake[i].x && y === snake[i].y) {
			isFinished = true;
		}
	}

	return isFinished;
}

function checkForFruit(snake, fruit) {
	const { x, y } = snake[snake.length - 1];
	return x === fruit.x && y === fruit.y;
}

function updateSnakePosition(snake, direction) {
	for (let i = 0; i < snake.length - 1; i++) {
		snake[i] = snake[i + 1];
	}

	let { x, y } = snake[snake.length - 1];

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

function createFruit(snake) {
	let x, y, position;

	do {
		const wRandom = random(snakeStep, width - snakeStep);
		const hRandom = random(snakeStep, height - snakeStep);
		x = wRandom - wRandom % snakeStep;
		y = hRandom - hRandom % snakeStep;
		position = { x, y };
	} while (snake.filter(part => part.x === x && part.y === y).length > 0);

	return position;
}

function createModel(weights) {
	let model;

	tf.tidy(() => {
		model = tf.sequential({
			layers: [
				tf.layers.dense({
					inputShape: [8],
					units: 8,
					useBias: false
				}),
				tf.layers.dense({
					units: 4,
					useBias: false
				})
			]
		});
		
		if (weights) {
			const weightsCopy = [];
			
			for (let i = 0; i < weights.length; i++) {
				weightsCopy.push(weights[i].clone());
			}
			
			model.setWeights(weightsCopy);
		}
	});

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

function render() {
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