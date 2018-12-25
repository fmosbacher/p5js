class Behavior {
	
	constructor() {
		this.maxSpeed = 5;
		this.maxForce = 1;
	}

	align(boid, others) {
		let avgVel = createVector();
		let desiredVel = createVector();

		if (others.length === 0) {
			return desiredVel;
		}

		for (let other of others) {
			avgVel.add(other.vel);
		}

		desiredVel = avgVel.div(others.length).setMag(this.maxSpeed);

		desiredVel
			.sub(boid.vel)
			.setMag(this.maxForce);

		return desiredVel;
	}

	group(boid, others) {
		let avgPos = createVector();
		let desiredVel = createVector();

		if (others.length === 0) {
			return desiredVel;
		}

		for (let other of others) {
			avgPos.add(other.pos);
		}

		avgPos.div(others.length);

		desiredVel = avgPos
			.sub(boid.pos)
			.setMag(this.maxSpeed)
			.sub(boid.vel)
			.setMag(this.maxForce);

		return desiredVel;
	}

	separate(boid, others) {
		let desiredVel = createVector();

		if (others.length === 0) {
			return desiredVel;
		}

		for (let other of others) {
			let otherDist = p5.Vector.sub(boid.pos, other.pos);
			desiredVel.add(otherDist.div(pow(otherDist.mag(), 2)));
		}

		desiredVel
			.div(others.length)
			.setMag(this.maxSpeed)
			.sub(boid.vel)
			.setMag(this.maxForce);

		return desiredVel;
	}

	avoidEdges(boid) {
		const distToEdge = boid.size;
		
		if (boid.pos.x > width - distToEdge) {
			return createVector(-this.maxSpeed, boid.vel.y)
				.sub(boid.vel)
				.limit(this.maxForce);
		} else if (boid.pos.x < distToEdge) {
			return createVector(this.maxSpeed, boid.vel.y)
				.sub(boid.vel)
				.limit(this.maxForce);
		}

		if (boid.pos.y > height - distToEdge) {
			return createVector(boid.vel.x, -this.maxSpeed)
				.sub(boid.vel)
				.limit(this.maxForce);
		} else if (boid.pos.y < distToEdge) {
			return createVector(boid.vel.x, this.maxSpeed)
				.sub(boid.vel)
				.limit(this.maxForce);
		}
		
		return createVector();
	}

}
