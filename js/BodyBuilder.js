BPT.BodyBuilder = (function() {
	function BodyBuilder() {
	}
	var phys2D;
	BodyBuilder.create = function(params) {
		var bodyBuilder = new BodyBuilder();
		phys2D = params.phys2D;
		return bodyBuilder;
	}
	BodyBuilder.prototype.buildChars = function(jsonData) {
		var charDefinitions = JSON.parse(jsonData);
		return charDefinitions.map(function(charDefinition) {
			return charDefinition.map(createBody);
		});
	}
	function createBody(bodyDefinition) {
		// Leave hinges untouched
		if (!bodyDefinition.id) return bodyDefinition;

		var shapeDefinitions = bodyDefinition.shapes.map(function(shape){
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

		var shapes = shapeDefinitions.map(function(shapeDefinition) {
			return createShape(shapeDefinition, bodyDefinition);
		});
		var body = phys2D.createRigidBody({shapes: shapes});
		body.alignWithOrigin();
		var bounds = body.computeWorldBounds();
		body.userData = {
			id: bodyDefinition.id,
			imageOffset: bodyDefinition.imageOffset || [0, 0],
			topLeft: [bounds[0], bounds[1]],
			zIndex: bodyDefinition.zIndex
		};
		return body;
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
				material: material,
				group: bodyDefinition.group,
				mask:  bodyDefinition.mask
			});
		} else {
			return phys2D.createPolygonShape({
				vertices: shapeDefinition,
				material: material,
				group: bodyDefinition.group,
				mask:  bodyDefinition.mask
			});
		}
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
