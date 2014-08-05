PropManager.managers.simpleProp = {
	init: function(prop, stageElement, phys2D, world) {
		this._createPropPhysics (prop, phys2D, world);
		this._createPropElements(prop, stageElement);
	},
	update: function(prop) {
		this._syncPropPhysics (prop);
		this._syncPropElements(prop);
	},
	destruct: function(prop, stageElement, phys2D, world) {
		this._removePropPhysics (prop, world);
		this._removePropElements(prop, stageElement);
	},
	propDefs: null,

	// Physics -------------------------------------------------------------
	_createPropPhysics: function(prop, phys2D, world) {
		var propDef = this.propDefs[prop.name];
		prop.bodies.forEach(function(body, bodyIndex) {
			var bodyDef = propDef.bodies[bodyIndex];

			var physicsBody = BodyBuilder.createBody(bodyDef, phys2D);
			physicsBody.setPosition(body.position);
			physicsBody.setRotation(body.rotation);
			physicsBody.setVelocity(body.velocity);
			physicsBody.setAngularVelocity(body.angularVelocity);
			physicsBody.userData = {prop: prop};
			
			world.addRigidBody(physicsBody);
			Object.defineProperty(body, 'physicsBody', {
				value: physicsBody
			});
		});
		if (propDef.constraints) {
			propDef.constraints.forEach(function(constraintDef) {
				var bodyA = prop.bodies[constraintDef.bodyA];
				var bodyB = prop.bodies[constraintDef.bodyB];
				var bodyDefA = propDef.bodies[constraintDef.bodyA];
				var bodyDefB = propDef.bodies[constraintDef.bodyB];
				world.addConstraint(phys2D.createPointConstraint({
					bodyA: bodyA.physicsBody,
					bodyB: bodyB.physicsBody,
					anchorA: VMath.v2Add(constraintDef.anchorA, bodyDefA.topLeft),
					anchorB: VMath.v2Add(constraintDef.anchorB, bodyDefB.topLeft),
					stiff: constraintDef.stiff
				}));
			});
		}
	},

	_syncPropPhysics: function(prop) {
		prop.bodies.forEach(this._syncBodyPhysics);
	},
	_syncBodyPhysics: function(body) {
		var physicsBody = body.physicsBody;
		
		physicsBody.getPosition(body.position);
		body.rotation = physicsBody.getRotation();
		physicsBody.getVelocity(body.velocity);
		body.angularVelocity = physicsBody.getAngularVelocity();
	},

	_removePropPhysics: function(prop, world) {
		prop.bodies.forEach(function(body) {
			world.removeRigidBody(body.physicsBody);
		});
	},

	// Elements ------------------------------------------------------------
	_createPropElements: function(prop, stageElement) {
		var propDef = this.propDefs[prop.name];
		prop.bodies.forEach(function(body, bodyIndex) {
			var bodyDef = propDef.bodies[bodyIndex];
			var bodyName = bodyDef.name || prop.name;

			// Create element
			var element = document.createElement('div');
			element.className = 'body';

			// Create <img>
			var image = document.createElement('img');
			var imageOffset = bodyDef.totalImageOffset;
			image.style.left = (imageOffset[0] * config.elementScale) + 'px';
			image.style.top  = (imageOffset[1] * config.elementScale) + 'px';

			// Scale <img>
			var transformString = 'scale(' + (config.elementScale / config.imageScale) + ')';
			image.style.webkitTransform = transformString;
			image.style.mozTransform    = transformString;
			image.style.transform       = transformString;
			image.src = 'images/' + bodyName + '.png';

			element.appendChild(image);
			stageElement.appendChild(element);
			Object.defineProperty(body, 'element', {
				value: element
			});
		});
	},

	_syncPropElements: function(prop) {
		prop.bodies.forEach(this._syncBodyElement);
	},
	_syncBodyElement: function(body) {
		transformString =
			'translate3d(' +
				(body.position[0] * config.elementScale) + 'px,' +
				(body.position[1] * config.elementScale) + 'px,0)' +
			'rotate(' + (degreesPerRadian * body.rotation) + 'deg)';
		body.element.style.webkitTransform = transformString;
		body.element.style.mozTransform    = transformString;
		body.element.style.transform       = transformString;
	},

	_removePropElements: function(prop, stageElement) {
		prop.bodies.forEach(function(body) {
			stageElement.removeChild(body.element);
		});
	}
};
