// let boids = [];
let flock;
let alignSlider, groupingSlider, separationSlider, visibleAreaSlider;
let min = -0.5;
let max = 5;
let step = 0.05;
let start = 0;

function setup() {
	createCanvas(900, 620);
	// alignSlider = createSlider(min, max, start, step).position(20, 20);
	// groupingSlider = createSlider(min, max, start, step).position(20, 60);
	// separationSlider = createSlider(min, max, start, step).position(20, 100);
	// visibleAreaSlider = createSlider(0, 500, 20, 10).position(20, 140);

	// createP('ALIGN').position(160, 10);
	// createP('GROUP').position(160, 50);
	// createP('SEPARATE').position(160, 90);
	// createP('VISIBLE AREA').position(160, 130);
	
	flock = new Flock(1000);
	
	// for (let i = 0; i < 10; i++) {
	// 	boids.push(new Boid());
	// }
}

function draw() {
	background('orangered');
	flock.update();
	flock.draw();
	// for (let boid of boids) {
	// 	boid.update();
	// 	boid.draw();
	// }
}
