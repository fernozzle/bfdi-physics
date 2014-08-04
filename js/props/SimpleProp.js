var SimpleProp = {
	init: function(prop, stageElement, phys2D) {
		this._createPropPhysics (prop, phys2D);
		this._createPropElements(prop, stageElement);
	},
	update: function(prop) {
		this._syncPropPhysics (prop);
		this._syncPropElements(prop);
	},

	// Physics -------------------------------------------------------------
	_createPropPhysics: function(prop, phys2D) {
		var propDef = propDefs[prop.name];
		prop.bodies.forEach(function(body, bodyIndex) {
			var bodyDef = propDef.bodies[bodyIndex];

			var physicsBody = BodyBuilder.createBody(bodyDef, phys2D);
			physicsBody.setPosition(body.position);
			physicsBody.setRotation(body.rotation);
			physicsBody.setVelocity(body.velocity);
			physicsBody.setAngularVelocity(body.angularVelocity);
			
			world.addRigidBody(physicsBody);
			Object.defineProperty(body, 'physicsBody', {
				value: physicsBody,
				writable: true
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

	// Elements ------------------------------------------------------------
	_createPropElements: function(prop, stageElement) {
		var propDef = propDefs[prop.name];
		prop.bodies.forEach(function(body, bodyIndex) {
			var bodyDef = propDef.bodies[bodyIndex];
			var bodyName = bodyDef.name || prop.name;

			// Create element
			var element = document.createElement('div');
			element.className = 'body';

			// Create <img>
			var image = document.createElement('img');
			var imageOffset = bodyDef.totalImageOffset;
			image.style.left = (imageOffset[0] * state.camera.zoom) + 'px';
			image.style.top  = (imageOffset[1] * state.camera.zoom) + 'px';

			// Scale <img>
			var transformString = 'scale(' + (state.camera.zoom / config.imageScale) + ')';
			image.style.webkitTransform = transformString;
			image.style.mozTransform    = transformString;
			image.style.transform       = transformString;
			image.src = 'images/' + bodyName + '.png';

			element.appendChild(image);
			stageElement.appendChild(element);
			Object.defineProperty(body, 'element', {
				value: element,
				writable: true
			});	
		});
	},
	_syncPropElements: function(prop) {
		prop.bodies.forEach(this._syncBodyElement);
	},
	_syncBodyElement: function(body) {
		transformString =
			'translate3d(' +
				(body.position[0] * state.camera.zoom) + 'px,' +
				(body.position[1] * state.camera.zoom) + 'px,0)' +
			'rotate(' + (degreesPerRadian * body.rotation) + 'deg)';
		body.element.style.webkitTransform = transformString;
		body.element.style.mozTransform    = transformString;
		body.element.style.transform       = transformString;
	}
}
