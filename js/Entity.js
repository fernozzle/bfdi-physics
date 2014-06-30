BPT.Entity = function (object) {
	this.element = null;
	this.body = this.createBody(object);
}

BPT.Entity.prototype = {
	createBody: function (object) {
		var bodyDef = new Box2D.Dynamics.b2BodyDef();
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
		
		var body = world.CreateBody (bodyDef);
		
		var shapes = object.shapes;

		// Mirror polygons
		var shapes = shapes.map (function (shape) {
			if (this.shapeIsCircle (shape)) {
				return shape;
			} else {
				return this.mirrorPolygon (shape, object.mirrorX, object.mirrorY);
			}
		}, this);

		// Get top-left corner
		var topLeft = this.minVertex (shapes.map (function (shape) {
			return this.getTopLeft (shape);
		}, this));
		
		// Move shapes so that the top-left corner is at the origin
		shapes = shapes.map (function (shape) {
			return this.translateShape (shape, [-topLeft[0], -topLeft[1]]);
		}, this);

		// Create and add fixtures
		shapes.forEach (function (shape) {
			body.CreateFixture (this.createFixtureDef (shape, object));
		}, this);

		return body;
	},

	createFixtureDef: function (shape, object) {
		var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
		fixtureDef.density = object.density;
		fixtureDef.friction = object.friction;
		fixtureDef.restitution = object.restitution;
		if (this.shapeIsCircle (shape)) {
			fixtureDef.shape = new Box2D.Collision.Shapes.b2CircleShape (shape.radius);
			fixtureDef.shape.m_p.x = shape.center[0];
			fixtureDef.shape.m_p.y = shape.center[1];
		} else {
			fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
			var vec2s = shape.map (function (vertex) {
				return new Box2D.Common.Math.b2Vec2 (vertex[0], vertex[1]);
			});
			fixtureDef.shape.SetAsArray (vec2s);
		}
		return fixtureDef;
	},

	getTopLeft: function (shape) {
		if (this.shapeIsCircle (shape)) {
			return [
				shape.center[0] - shape.radius,
				shape.center[1] - shape.radius
			];
		} else {
			return this.minVertex (shape);
		}
	},

	minVertex: function (vertices) {
		return vertices.reduce (function (prev, cur) {
			return [
				Math.min (prev[0], cur[0]),
				Math.min (prev[1], cur[1])
			];
		});
	},

	mirrorPolygon: function (vertices, mirrorX, mirrorY) {
		var newVertices = [];
		var reversedVertices = vertices.slice().reverse();
		if (true) {
			vertices.forEach (function (inputVertex) {
				newVertices.push ([inputVertex[0], inputVertex[1]]);
			});
		}
		if (mirrorX) {
			reversedVertices.forEach (function (inputVertex) {
				if (inputVertex[0] === 0) return;
				newVertices.push ([-inputVertex[0], inputVertex[1]]);
			});
		}
		if (mirrorX && mirrorY) {
			vertices.forEach (function (inputVertex) {
				if (inputVertex[0] === 0 || inputVertex[1] === 0) return;
				newVertices.push ([-inputVertex[0], -inputVertex[1]]);
			});
		}
		if (mirrorY) {
			reversedVertices.forEach (function (inputVertex) {
				if (inputVertex[1] === 0) return;
				newVertices.push ([inputVertex[0], -inputVertex[1]]);
			});
		}
		return newVertices;
	},

	translateShape: function (shape, direction) {
		if (this.shapeIsCircle (shape)) {
			return {
				radius: shape.radius,
				center: [
					shape.center[0] + direction[0],
					shape.center[1] + direction[1]
				]
			};
		} else {
			return shape.map (function (vertex) {
				return [
					vertex[0] + direction[0],
					vertex[1] + direction[1]
				];
			});
		}
	},

	shapeIsCircle: function (shape) {
		return shape.radius !== undefined;
	}
};
