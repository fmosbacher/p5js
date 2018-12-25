class Circle {

	constructor(x, y, radius) {
		this.pos = { x, y };
		this.radius = radius;
	}

	intersects(rectangle) {
		const xDiff = Math.abs(this.pos.x - rectangle.pos.x);
		const yDiff = Math.abs(this.pos.y - rectangle.pos.y);
		const cx = this.pos.x, cy = this.pos.y;
		const cRadius = this.radius;
		const rx = rectangle.pos.x, ry = rectangle.pos.y;
		const rw = rectangle.width, rh = rectangle.height;

		if (cx >= rx - rw / 2 && cx <= rx + rw / 2) {
			return yDiff <= cRadius + rh / 2;
		}
	
		if (cy >= ry - rh / 2 && cy <= ry + rh / 2) {
			return xDiff <= cRadius + rw / 2;
		}
	
		return Math.pow(xDiff - rw, 2) + Math.pow(yDiff - rh, 2) < cRadius * cRadius;
	}

	contains(point) {
		const xDiff = Math.abs(this.pos.x - point.pos.x);
		const yDiff = Math.abs(this.pos.y - point.pos.y);
		const dist = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
		
		return dist <= this.radius;
	}

}