function setup() {
	createCanvas(500, 500);
}

function draw() {
	background('black');
	noFill();

	stroke('red');
	strokeWeight(1);

	if (intersects()) {
		stroke('green');
		strokeWeight(4);
	}

	ellipse(mouseX, mouseY, 100);

	rectMode(CENTER);
	rect(200, 300, 500, 500);
}

function intersects() {
	const centerDistX = Math.abs(mouseX - 200);
	const centerDistY = Math.abs(mouseY - 300);

	if (mouseX >= 200 - 250 && mouseX <= 200 + 250) {
		return centerDistY <= 50 + 250;
	}

	if (mouseY >= 300 - 250 && mouseY <= 300 + 250) {
		return centerDistX <= 50 + 250;
	}

	return Math.pow(centerDistX - 250, 2) + Math.pow(centerDistY - 250, 2) < 50 * 50;

	return true;
}
