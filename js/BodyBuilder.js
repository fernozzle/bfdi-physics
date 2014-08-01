var BodyBuilder = (function() {
	return {
		createBody: function(bodyDef, phys2D) {
			// Mirror polygonal shape defs
			var shapeDefs = bodyDef.shapes.map(function(shapeDef){
				// Circles are untouched
				if (shapeDefIsCircle(shapeDef)) return shapeDef;
				return mirrorPolygon(shapeDef, bodyDef);
			});

			// Create shapes
			var shapes = shapeDefs.map(function(shapeDef) {
				return createShape(shapeDef, bodyDef, phys2D);
			});

			// Create body
			var body = phys2D.createRigidBody({shapes: shapes});
			body.alignWithOrigin();
			
			// Set `totalImageOffset` and `topLeft` in body def
			var bounds = body.computeWorldBounds();
			var imageOffset = bodyDef.imageOffset || [0, 0];
			var topLeft     = [bounds[0], bounds[1]];
			bodyDef.totalImageOffset = VMath.v2Add(topLeft, imageOffset);
			bodyDef.topLeft          = topLeft;

			return body;
		}
	};

	function createShape(shapeDef, bodyDef, phys2D) {
		var material = phys2D.createMaterial({
			elasticity:      bodyDef.restitution,
			dynamicFriction: bodyDef.friction,
			density:         bodyDef.density,
		});

		if(shapeDefIsCircle(shapeDef)) {
			return phys2D.createCircleShape({
				radius:   shapeDef.radius,
				origin:   shapeDef.origin,
				material: material,
				group:    bodyDef.group,
				mask:     bodyDef.mask
			});
		} else {
			return phys2D.createPolygonShape({
				vertices: shapeDef,
				material: material,
				group:    bodyDef.group,
				mask:     bodyDef.mask
			});
		}
	}
	function mirrorPolygon(verts, bodyDef) {
		var newVerts = [];
		var reversedVerts = verts.slice().reverse();
		if (true) {
			verts.forEach(function(vert) {
				newVerts.push([vert[0], vert[1]]);
			});
		}
		if (bodyDef.mirrorX) {
			reversedVerts.forEach(function(vert) {
				if(vert[0] === 0) return;
				newVerts.push([-vert[0], vert[1]]);
			});
		}
		if (bodyDef.mirrorX && bodyDef.mirrorY) {
			verts.forEach(function(vert) {
				if(vert[0] === 0 || vert[1] === 0) return;
				newVerts.push([-vert[0], -vert[1]]);
			});
		}
		if (bodyDef.mirrorY) {
			reversedVerts.forEach(function(vert) {
				if(vert[1] === 0) return;
				newVerts.push([vert[0], -vert[1]]);
			});
		}
		return newVerts;
	}

	function shapeDefIsCircle(shape) {
		return shape.radius !== undefined;
	}
})();
