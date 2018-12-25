class Boid {

	constructor() {
		this.behavior = new Behavior();
		this.pos = createVector(random(width), random(height));
		this.vel = p5.Vector.random2D().setMag(random(this.behavior.maxSpeed));
		this.acc = createVector();
		this.steeringForce = createVector();
		this.size = 2;
		this.visibleArea = this.size * 30;
	}

	update(qtree) {
		// const visibleBoids = flock.boids.filter(other => {
		// 	if (other !== this) {
		// 		const otherDist = dist(
		// 			this.pos.x,
		// 			this.pos.y,
		// 			other.pos.x,
		// 			other.pos.y
		// 		);
				
		// 		if (otherDist < this.visibleArea) {
		// 			return other;
		// 		}
		// 	}
		// });

		const points = qtree.query(new Circle(this.pos.x, this.pos.y, this.visibleArea));
		const visibleBoids = points.filter(p => p.data !== this).map(p => p.data);

		// this.steeringForce.add(this.behavior.avoidEdges(this));
		// this.steeringForce.add(this.behavior.group(this, visibleBoids).mult(groupingSlider.value()));
		// this.steeringForce.add(this.behavior.align(this, visibleBoids).mult(alignSlider.value()));
		// this.steeringForce.add(this.behavior.separate(this, visibleBoids).mult(separationSlider.value()));
		this.steeringForce.add(this.behavior.group(this, visibleBoids));
		this.steeringForce.add(this.behavior.align(this, visibleBoids));
		this.steeringForce.add(this.behavior.separate(this, visibleBoids));

		if (this.pos.x > width + this.size / 2) {
			this.pos.x = -this.size / 2;
		} else if (this.pos.x < -this.size / 2) {
			this.pos.x = width + this.size / 2
		}

		if (this.pos.y > height + this.size / 2) {
			this.pos.y = -this.size / 2;
		} else if (this.pos.y < -this.size / 2) {
			this.pos.y = height + this.size / 2
		}
	}

	applyForce() {
		this.acc.add(this.steeringForce);
		this.vel.add(this.acc).limit(this.maxSpeed);
		this.pos.add(this.vel);

		this.steeringForce.mult(0);
		this.acc.mult(0);
	}

	draw() {
		fill('black');
		ellipse(this.pos.x, this.pos.y, this.size);
	}

}