class QuadTree {

	constructor(boundary, capacity) {
		this.boundary = boundary;
		this.capacity = capacity;
		this.points = [];
		this.isDivided = false;
		this.northeast;
		this.northwest;
		this.southeast;
		this.southwest;
	}

	insert(point) {
		if (this.points.length < this.capacity) {
			this.points.push(point);
		} else {
			if (!this.isDivided) {
				this.isDivided = true;
				this.subdivide();
			}
			if (point.pos.x > this.boundary.pos.x) {
				if (point.pos.y > this.boundary.pos.y) {
					this.southeast.insert(point);
				} else {
					this.northeast.insert(point);
				}
			} else {
				if (point.pos.y > this.boundary.pos.y) {
					this.southwest.insert(point);
				} else {
					this.northwest.insert(point);
				}
			}
		}
	}

	query(range, pointsInRange) {
		if (!pointsInRange) {
			pointsInRange = [];
		}

		if (range.intersects(this.boundary)) {
			for (point of this.points) {
				if (range.contains(point)) {
					pointsInRange.push(point);
				}
			}
		} else {
			return pointsInRange;
		}

		if (this.isDivided) {
			this.northeast.query(range, pointsInRange);
			this.northwest.query(range, pointsInRange);
			this.southeast.query(range, pointsInRange);
			this.southwest.query(range, pointsInRange);
		}

		return pointsInRange;
	}

	subdivide() {
		const x = this.boundary.pos.x, y = this.boundary.pos.y;
		const w = this.boundary.width, h = this.boundary.height;

		this.northeast = new QuadTree(
			new Rectangle(x + w / 4, y - h / 4, w / 2, h / 2), this.capacity
		);

		this.northwest = new QuadTree(
			new Rectangle(x - w / 4, y - h / 4, w / 2, h / 2), this.capacity
		);

		this.southeast = new QuadTree(
			new Rectangle(x + w / 4, y + h / 4, w / 2, h / 2), this.capacity
		);

		this.southwest = new QuadTree(
			new Rectangle(x - w / 4, y + h / 4, w / 2, h / 2), this.capacity
		);
	}

	draw() {
		if (this.isDivided) {
			this.northwest.draw();
			this.northeast.draw();
			this.southwest.draw();
			this.southeast.draw();
		}
		
		for (let p of this.points) {
			stroke('red');
			noFill();
			strokeWeight(5);
			point(p.pos.x, p.pos.y);
		}
		
		rectMode(CENTER);
		noFill();
		stroke('white');
		strokeWeight(1);
		rect(
			this.boundary.pos.x, this.boundary.pos.y,
			this.boundary.width, this.boundary.height
		);
	}

}