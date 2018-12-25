class Flock {

	constructor(nBoids) {
		this.boids = [];
		for (let i = 0; i < nBoids; i++) {
			const boid = new Boid();
			this.boids.push(boid);
		}
	}

	update() {
		const qtree = new QuadTree(new Rectangle(width / 2, height / 2, width, height), 4);

		for (let boid of this.boids) {
			const point = new Point(boid.pos.x, boid.pos.y, boid);
			qtree.insert(point);
		}

		for (let boid of this.boids) {
			boid.update(qtree);
		}
	}

	draw() {
		for (let boid of this.boids) {
			boid.applyForce();
			boid.draw();
		}
	}

}