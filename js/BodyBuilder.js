BPT.BodyBuilder = (function() {
	function BodyBuilder() {
	}
	BodyBuilder.create = function(params) {
		var bodyBuilder = new BodyBuilder();
		bodyBuilder.phys2D = params.phys2D;
		return bodyBuilder;
	}
	BodyBuilder.prototype.buildBodies = function(jsonData) {
		var bodies = {};
		var bodyDefinitions = JSON.parse(jsonData);
		for (var bodyName in bodyDefinitions) {
			var bodyDefinition = bodyDefinitions[bodyName];
			var shapeDefinitions = processShapeDefinitions(bodyDefinition.shapes);

			var shapes = shapeDefinitions.map(function(shapeDefinition) {
				return createShape(shapeDefinition, bodyDefinition);
			});
			var body = this.phys2D.createRigidBody({
				shapes: shapes
			});
			bodies[bodyName] = body;
		}
	}
	function createShape(shapeDefinition, bodyDefinition) {
		var material = this.phys2D.createMaterial({
			elasticity: bodyDefinition.restitution,
			dynamicFriction: bodyDefinition.friction,
			density: bodyDefinition.density,
		});

		if(shapeDefinitionIsCircle(shapeDefinition)) {
			return this.phys2D.createPolygonShape({
				vertices: shapeDefinition,
				material: material
			});
		} else {
			return this.phys2D.createCircleShape({
				radius: shapeDefinition.radius,
				origin: shapeDefinition.origin,
				material: material
			});
		}
	}
	function processShapeDefinitions(shapeDefinitions, bodyDefinition) {
		// Mirror polygons
		shapeDefinitions = shapeDefinitions.map(function(shape) {
			if(shapeDefinitionIsCircle(shape)) {
				return shape;
			} else {
				return mirrorPolygon(
					shape,
					bodyDefinition.mirrorX,
					bodyDefinition.mirrorY
				);
			}
		});
		// Get top-left corner
		var topLeft = vertexMin(shapeDefinitions.map(function(shape) {
			return getTopLeft(shape);
		}));
		if(bodyDefinition.margin) {
			topLeft[0] -= bodyDefinition.margin[0];
			topLeft[1] -= bodyDefinition.margin[1];
		}

		// Move shape definitions so that the top-left corner is at the origin
		shapeDefinitions = shapeDefinitions.map(function(shape) {
			return translateShapeDefinition(shape, [-topLeft[0], -topLeft[1]]);
		});

		return shapeDefinitions;
	}
	function getTopLeft(shape) {
		if(shapeDefinitionIsCircle(shape)) {
			return [
				shape.origin[0] - shape.radius,
				shape.origin[1] - shape.radius
			];
		} else {
			return vertexMin(shape);
		}
	}

	function vertexMin(vertices) {
		return vertices.reduce(function(prev, cur) {
			return [
				Math.min(prev[0], cur[0]),
				Math.min(prev[1], cur[1])
			];
		});
	}

	function mirrorPolygon(vertices, mirrorX, mirrorY) {
		var newVertices = [];
		var reversedVertices = vertices.slice().reverse();
		if(true) {
			vertices.forEach(function(inputVertex) {
				newVertices.push([inputVertex[0], inputVertex[1]]);
			});
		}
		if(mirrorX) {
			reversedVertices.forEach(function(inputVertex) {
				if(inputVertex[0] === 0) return;
				newVertices.push([-inputVertex[0], inputVertex[1]]);
			});
		}
		if(mirrorX && mirrorY) {
			vertices.forEach(function(inputVertex) {
				if(inputVertex[0] === 0 || inputVertex[1] === 0) return;
				newVertices.push([-inputVertex[0], -inputVertex[1]]);
			});
		}
		if(mirrorY) {
			reversedVertices.forEach(function(inputVertex) {
				if(inputVertex[1] === 0) return;
				newVertices.push([inputVertex[0], -inputVertex[1]]);
			});
		}
		return newVertices;
	}

	function translateShapeDefinition(shape, direction) {
		if(shapeDefinitionIsCircle(shape)) {
			return {
				radius: shape.radius,
				origin: [
					shape.origin[0] + direction[0],
					shape.origin[1] + direction[1]
				]
			};
		} else {
			return shape.map(function(vertex) {
				return [
					vertex[0] + direction[0],
					vertex[1] + direction[1]
				];
			});
		}
	}

	function shapeDefinitionIsCircle(shape) {
		return shape.radius !== undefined;
	}
	return BodyBuilder;
})();
