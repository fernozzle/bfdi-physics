// Prop setup ----------
var propDefs;
var request = new XMLHttpRequest();
request.open("GET", "characters.json");
request.onload = function() {
	propDefs = JSON.parse(request.responseText);

	// Building test scene
	state = {};
	state.props = [];
	for (name in propDefs) {
		var bodies = [];
		propDefs[name].bodies.forEach(function() {
			bodies.push({
				position: [10, 10],
				rotation: 0,
				velocity: [0, 0],
				angularVelocity: 0
			});
		});
		state.props.push({
			name:   name,
			bodies: bodies
		});
	}

	init();
	requestAnimFrame(update);
}
request.send();

// Scene setup ----------

var stageWidth  = 30;
var stageHeight = 22;
var state;

function createPhysicsRepresentation(prop) {
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
}
function createElementRepresentation(prop) {
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
		image.style.left = (imageOffset[0] * graphicsScale) + 'px';
		image.style.top  = (imageOffset[1] * graphicsScale) + 'px';

		// Scale <img>
		var transformString = 'scale(' + (graphicsScale / imageScale) + ')';
		image.style.webkitTransform = transformString;
		image.style.mozTransform    = transformString;
		image.style.transform       = transformString;
		image.src = 'images/' + bodyName + '.png';

		element.appendChild(image);
		stage.appendChild(element);
		Object.defineProperty(body, 'element', {
			value: element,
			writable: true
		});	
	});
}
function syncPhysicsRepresentation(prop) {
	prop.bodies.forEach(function(body) {
		var physicsBody = body.physicsBody;
		
		physicsBody.getPosition(body.position);
		body.rotation = physicsBody.getRotation();
		physicsBody.getVelocity(body.velocity);
		body.angularVelocity = physicsBody.getAngularVelocity();
	});
}
function syncElementRepresentation(prop) {
	prop.bodies.forEach(function(body) {
		transformString = 
			'translate3d(' +
				(body.position[0] * graphicsScale) + 'px,' +
				(body.position[1] * graphicsScale) + 'px,0)' +
			'rotate(' + (degreesPerRadian * body.rotation) + 'deg)';
		body.element.style.webkitTransform = transformString;
		body.element.style.mozTransform    = transformString;
		body.element.style.transform       = transformString;
	});
}
// Graphics setup ----------

var imageScale    = 50; // Size of image dimensions compared to defined shapes
var graphicsScale = 40;  // Size to display bodies compared to defined shapes
var stage = document.getElementById('stage');
stage.style.width  = stageWidth  * graphicsScale + 'px';
stage.style.height = stageHeight * graphicsScale + 'px';
var degreesPerRadian = 57.2957795;

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
	        window.webkitRequestAnimationFrame || 
	        window.mozRequestAnimationFrame    || 
	        window.oRequestAnimationFrame      || 
	        window.msRequestAnimationFrame     || 
	        function(callback, element){
	          window.setTimeout(callback, 1000 / 60);
	        };
})();

// Physics setup ----------

var phys2D = Physics2DDevice.create();
var framerate = 60;
var footageSeconds = 60;
var machineryEnabled = true;

var world = phys2D.createWorld({gravity: [0, 20]});

var conveyorBeltMaterial = phys2D.createMaterial({
	elasticity: 0,
	staticFriction: 10,
	dynamicFriction: 8,
	rollingFriction: 0.1
});

var handReferenceBody = phys2D.createRigidBody({type: 'static'});
world.addRigidBody(handReferenceBody);
var handConstraint = null;

var animationState = 0;
var lift;
var pusher;

// FPS counter setup ----------

var previousTime = Date.now();
var fpsElement = document.getElementById('fps');

function init() {
	world.clear();

	handConstraint = null;

	var thickness = 0.01;
	var border = phys2D.createRigidBody({
		type: 'static',
		shapes: [
			phys2D.createPolygonShape({
				vertices: phys2D.createRectangleVertices(0, 0, thickness, stageHeight)
			}),
			phys2D.createPolygonShape({
				vertices: phys2D.createRectangleVertices(0, 0, stageWidth, thickness)
			}),
			phys2D.createPolygonShape({
				vertices: phys2D.createRectangleVertices((stageWidth - thickness), 0, stageWidth, stageHeight)
			}),
			phys2D.createPolygonShape({
				vertices: phys2D.createRectangleVertices(0, (stageHeight - thickness), stageWidth, stageHeight)
			})
		]
	});
	world.addRigidBody(border);

	var createBelt = function createBeltFn(x1, y1, x2, y2, radius, speed) {
		var normal = VMath.v2Build(y2 - y1, x1 - x2);
		var length = VMath.v2Length(normal);
		VMath.v2ScalarMul(normal, radius / length, normal);

		var element = document.createElement('div');
		element.className = 'belt';
		element.style.width  = ((length + 2 * radius) * graphicsScale) + 'px';
		element.style.height = (radius * 2 * graphicsScale) + 'px';
		var transformString = 
			'translate(' +
				((x1 + normal[0] + normal[1]) * graphicsScale) + 'px,' +
				((y1 + normal[1] - normal[0]) * graphicsScale) + 'px)' +
			'rotate(' +
				(degreesPerRadian * Math.atan2(y2 - y1, x2 - x1)) + 'deg)';
		element.style.webkitTransform = transformString;
		element.style.mozTransform = transformString;
		element.style.transform = transformString;
		stage.appendChild(element);

		var shapes = [
			phys2D.createPolygonShape({
				vertices: [
					[x1 + normal[0], y1 + normal[1]],
					[x2 + normal[0], y2 + normal[1]],
					[x2 - normal[0], y2 - normal[1]],
					[x1 - normal[0], y1 - normal[1]]
				],
				material: conveyorBeltMaterial
			}),
			phys2D.createCircleShape({
				radius: radius,
				origin: [x1, y1],
				material: conveyorBeltMaterial
			}),
			phys2D.createCircleShape({
				radius: radius,
				origin: [x2, y2],
				material: conveyorBeltMaterial
			})
		];
		return phys2D.createRigidBody({
			type: 'static',
			surfaceVelocity: [speed, 0],
			shapes: shapes
		});
	};

	if (machineryEnabled) {
		world.addRigidBody(createBelt( 0, 11,  7, 14, 0.5,  2));
		world.addRigidBody(createBelt( 7, 14, 12, 12, 0.5,  2));
		world.addRigidBody(createBelt(12, 18, 20, 15, 0.5, 12));
		world.addRigidBody(createBelt( 0, 22, 21, 22, 0.5,  2));
		world.addRigidBody(createBelt(20, 10, 10,  5, 0.5, -2));
		world.addRigidBody(createBelt(10,  5,  5,  5, 0.5, -2));

		// Create lift and pusher bodies.
		lift = phys2D.createRigidBody({
			shapes: [
				phys2D.createPolygonShape({
					vertices: phys2D.createBoxVertices(9, 0.01),
					elasticity: 1
				})
			],
			type: 'kinematic',
			position: [stageWidth - 4.5, stageHeight]
		});
		pusher = phys2D.createRigidBody({
			shapes: [
				phys2D.createPolygonShape({
					vertices: phys2D.createBoxVertices(9, 10)
				})
			],
			type: 'kinematic',
			position: [stageWidth + 4.5, 5]
		});
		world.addRigidBody(lift);
		world.addRigidBody(pusher);
		animationState = 0;
	}

	state.props.forEach(function(prop) {
		createPhysicsRepresentation(prop);
		createElementRepresentation(prop);
	});
	
	var mouseDown = function(e) {
		if (handConstraint) return;

		var point = [e.clientX, e.clientY];
		VMath.v2ScalarMul(point, 1 / graphicsScale, point);

		var bodies = [];
		world.bodyPointQuery(point, bodies);
		if (bodies[0] && bodies[0].isDynamic()) {
			handConstraint = phys2D.createPointConstraint({
				bodyA: handReferenceBody,
				bodyB: bodies[0],
				anchorA: point,
				anchorB: bodies[0].transformWorldPointToLocal(point),
				stiff: false,
				maxForce: 1e5
			});
			world.addConstraint(handConstraint);
		}

		return false;
	}
	var mouseMove = function(e) {
		if (!handConstraint) return;

		var point = [e.clientX, e.clientY];
		VMath.v2ScalarMul(point, 1 / graphicsScale, point);

		handConstraint.setAnchorA(point);
	}
	var mouseUp = function(e) {
		if (handConstraint) {
			world.removeConstraint(handConstraint);
			handConstraint = null;
		}
	}
	stage.onmousedown = mouseDown;
	stage.onmousemove = mouseMove;
	stage.onmouseup = mouseUp;
	stage.ontouchstart = function(e) {
		return mouseDown(e.touches[0]);
	}
	stage.ontouchmove = function(e) {
		return mouseMove(e.touches[0]);
	}
	stage.ontouchend = function(e) {
		return mouseUp(e.touches[0]);
	}
}

var update = function() {
	if (handConstraint) {
		var body = handConstraint.bodyB;
		body.setAngularVelocity(body.getAngularVelocity() * 0.9);
	}
	if (machineryEnabled) {
		if (animationState === 0) {
			// Start of animation, set velocity of lift to move up to the target
			// in 3 seconds.
			lift.setVelocityFromPosition([stageWidth - 4.5, 10], 0, 3);
			animationState = 1;
		} else if (animationState === 1) {
			if (lift.getPosition()[1] <= 10) {
				// Reached target position for lift.
				// Set position incase it over-reached and zero velocity.
				lift.setPosition([stageWidth - 4.5, 10]);
				lift.setVelocity([0, 0]);

				// Start pusher animation to move left.
				pusher.setVelocityFromPosition([stageWidth - 4.5, 5], 0, 1.5);
				animationState = 2;
			}
		} else if (animationState === 2) {
			if (pusher.getPosition()[0] <= (stageWidth - 4.5)) {
				// Reached target position for pusher.
				// Set velocities of pusher and lift to both move right off-screen.
				pusher.setVelocityFromPosition([stageWidth + 4.5, 5], 0, 1);
				lift.setVelocityFromPosition([stageWidth + 4.5, 10], 0, 1);
				animationState = 3;
			}
		} else if (animationState === 3) {
			if (pusher.getPosition()[0] >= stageWidth + 4.5) {
				// Reached target.
				// Reset positions and velocities and begin animation afresh.
				pusher.setPosition([stageWidth + 4.5, 5]);
				pusher.setVelocity([0, 0]);
				lift.setPosition([stageWidth - 4.5, stageHeight]);
				lift.setVelocity([0, 0]);
				animationState = 0;
			}
		}
	}

	world.step(1 / framerate);

	state.props.forEach(function(prop) {
		syncPhysicsRepresentation(prop);
		syncElementRepresentation(prop);
	});

	var currentTime = Date.now()
	var secondsElapsed = (currentTime - previousTime) / 1000;
	var fps = 1 / secondsElapsed;
	var renderSeconds = secondsElapsed * footageSeconds * framerate;
	fpsElement.innerHTML =
		('   ' + fps.toFixed(1)).substr(-5, 5) + 'fps | ' +
		footageSeconds + 's @ ' + framerate + 'fps &rarr; ' +
		(renderSeconds / 60 / 60).toFixed(2) + ' hours (' +
		(renderSeconds / 60).toFixed(1) + ' minutes)';
	previousTime = currentTime;

	requestAnimFrame(update);
}

