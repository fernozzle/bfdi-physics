PropManager.managers.belt = {
	init: function(prop, stageElement, phys2D, world) {
		this._createPropPhysics(prop, phys2D, world);
		this._createPropElement(prop, stageElement);
	},
	update: function(prop) {
	},
	destruct: function(prop, stageElement, phys2D, world) {
		this._removePropPhysics(prop, world);
		this._removePropElement(prop, stageElement);
	},

	// Physics -------------------------------------------------------------
	_createPropPhysics: function(prop, phys2D, world) {
		var normal = VMath.v2Build(
			prop.end[1] - prop.start[1],
			prop.start[0] - prop.end[0]
		);
		var length = VMath.v2Length(normal);
		VMath.v2ScalarMul(normal, prop.radius / length, normal);

		var shapes = [
			phys2D.createPolygonShape({
				vertices: [
					VMath.v2Add(prop.start, normal),
					VMath.v2Add(prop.end,   normal),
					VMath.v2Sub(prop.end,   normal),
					VMath.v2Sub(prop.start, normal)
				],
				material: conveyorBeltMaterial
			}),
			phys2D.createCircleShape({
				radius: prop.radius,
				origin: prop.start,
				material: conveyorBeltMaterial
			}),
			phys2D.createCircleShape({
				radius: prop.radius,
				origin: prop.end,
				material: conveyorBeltMaterial
			})
		];
		var physicsBody = phys2D.createRigidBody({
			type: 'static',
			surfaceVelocity: [prop.speed, 0],
			shapes: shapes,
			userData: {prop: prop}
		});
		world.addRigidBody(physicsBody);

		Object.defineProperty(prop, 'physicsBody', {
			value: physicsBody
		});
	},

	_removePropPhysics: function(prop, world) {
		world.removeRigidBody(prop.physicsBody);
	},

	// Elements ------------------------------------------------------------
	_createPropElement: function(prop, stageElement) {
		var normal = VMath.v2Build(
			prop.end[1] - prop.start[1],
			prop.start[0] - prop.end[0]
		);
		var length = VMath.v2Length(normal);
		VMath.v2ScalarMul(normal, prop.radius / length, normal);

		var element = document.createElement('div');
		element.className = 'belt';

		element.style.width  = ((length + 2 * prop.radius) * config.elementScale) + 'px';
		element.style.height = ((         2 * prop.radius) * config.elementScale) + 'px';
		var transformString =
			'translate(' +
				((prop.start[0] + normal[0] + normal[1]) * config.elementScale) + 'px,' +
				((prop.start[1] + normal[1] - normal[0]) * config.elementScale) + 'px)' +
			'rotate(' +
				(this._angleBetween(prop.start, prop.end) * degreesPerRadian) + 'deg)';
		element.style.webkitTransform = transformString;
		element.style.mozTransform    = transformString;
		element.style.transform       = transformString;

		stage.appendChild(element);
		Object.defineProperty(prop, 'element', {
			value: element
		});
	},
	_angleBetween: function(v1, v2) {
		return Math.atan2(
			v2[1] - v1[1],
			v2[0] - v1[0]
		);
	},

	_removePropElement: function(prop, stageElement) {
		stageElement.removeChild(prop.element);
	}
}
