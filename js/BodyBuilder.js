BPT.BodyBuilder = (function() {
	function BodyBuilder() {
	}
	var phys2D;
	BodyBuilder.create = function(params) {
		var bodyBuilder = new BodyBuilder();
		phys2D = params.phys2D;
		return bodyBuilder;
	}
	BodyBuilder.prototype.buildBodies = function(jsonData) {
		var bodies = {};
		var bodyDefinitions = JSON.parse(jsonData);
		for (var bodyName in bodyDefinitions) {
			var bodyDefinition = bodyDefinitions[bodyName];
			var shapeDefinitions = processShapeDefinitions(
				bodyDefinition.shapes,
				bodyDefinition
			);

			var shapes = shapeDefinitions.map(function(shapeDefinition) {
				return createShape(shapeDefinition, bodyDefinition);
			});
			var body = phys2D.createRigidBody({shapes: shapes});
			body.alignWithOrigin();
			body.userData = {margin: findMargin(body, bodyDefinition)};
			bodies[bodyName] = body;
		}
		return bodies;
	}
	function findMargin(body, bodyDefinition) {
		var bounds = body.computeWorldBounds();
		var margin = bodyDefinition.margin || [0, 0];
		return VMath.v2Sub(margin, [bounds[0], bounds[1]]);
	}
	function createShape(shapeDefinition, bodyDefinition) {
		var material = phys2D.createMaterial({
			elasticity:      bodyDefinition.restitution,
			dynamicFriction: bodyDefinition.friction,
			density:         bodyDefinition.density,
		});

		if(shapeDefinitionIsCircle(shapeDefinition)) {
			return phys2D.createCircleShape({
				radius: shapeDefinition.radius,
				origin: shapeDefinition.origin,
				material: material
			});
		} else {
			return phys2D.createPolygonShape({
				vertices: shapeDefinition,
				material: material
			});
		}
	}
	function processShapeDefinitions(shapeDefinitions, bodyDefinition) {
		// Mirror polygons
		shapeDefinitions = shapeDefinitions.map(function(shape) {
			if (shapeDefinitionIsCircle(shape)) {
				return shape;
			} else {
				return mirrorPolygon(
					shape,
					bodyDefinition.mirrorX,
					bodyDefinition.mirrorY
				);
			}
		});
		return shapeDefinitions;
	}
	function mirrorPolygon(vertices, mirrorX, mirrorY) {
		var newVertices = [];
		var reversedVertices = vertices.slice().reverse();
		if (true) {
			vertices.forEach(function(inputVertex) {
				newVertices.push([inputVertex[0], inputVertex[1]]);
			});
		}
		if (mirrorX) {
			reversedVertices.forEach(function(inputVertex) {
				if(inputVertex[0] === 0) return;
				newVertices.push([-inputVertex[0], inputVertex[1]]);
			});
		}
		if (mirrorX && mirrorY) {
			vertices.forEach(function(inputVertex) {
				if(inputVertex[0] === 0 || inputVertex[1] === 0) return;
				newVertices.push([-inputVertex[0], -inputVertex[1]]);
			});
		}
		if (mirrorY) {
			reversedVertices.forEach(function(inputVertex) {
				if(inputVertex[1] === 0) return;
				newVertices.push([inputVertex[0], -inputVertex[1]]);
			});
		}
		return newVertices;
	}

	function shapeDefinitionIsCircle(shape) {
		return shape.radius !== undefined;
	}
	return BodyBuilder;
})();
