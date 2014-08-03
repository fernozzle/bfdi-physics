var state = {
	gravity: [0, 20],
	size: [30, 22],
	props: [],
	camera: {zoom: 40}
};

var config = {
	imageScale: 50, // Size of images compared to defined shapes
	framerate: 60
};
var footageSeconds = 60;

// Scene setup ----------

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
		image.style.left = (imageOffset[0] * state.camera.zoom) + 'px';
		image.style.top  = (imageOffset[1] * state.camera.zoom) + 'px';

		// Scale <img>
		var transformString = 'scale(' + (state.camera.zoom / config.imageScale) + ')';
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
				(body.position[0] * state.camera.zoom) + 'px,' +
				(body.position[1] * state.camera.zoom) + 'px,0)' +
			'rotate(' + (degreesPerRadian * body.rotation) + 'deg)';
		body.element.style.webkitTransform = transformString;
		body.element.style.mozTransform    = transformString;
		body.element.style.transform       = transformString;
	});
}
// Graphics setup ----------

var stage = document.getElementById('stage');
stage.style.width  = state.size[0] * state.camera.zoom + 'px';
stage.style.height = state.size[1] * state.camera.zoom + 'px';
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
var world = phys2D.createWorld({gravity: state.gravity});

var conveyorBeltMaterial = phys2D.createMaterial({
	elasticity: 0,
	staticFriction: 10,
	dynamicFriction: 8,
	rollingFriction: 0.1
});

// FPS counter setup ----------

var previousTime = Date.now();
var fpsElement = document.getElementById('fps');

function init() {
	world.clear();

	var thickness = 0.01;
	var border = phys2D.createRigidBody({
		type: 'static',
		shapes: [
			phys2D.createPolygonShape({
				vertices: phys2D.createRectangleVertices(0, 0, thickness, state.size[1])
			}),
			phys2D.createPolygonShape({
				vertices: phys2D.createRectangleVertices(0, 0, state.size[0], thickness)
			}),
			phys2D.createPolygonShape({
				vertices: phys2D.createRectangleVertices((state.size[0] - thickness), 0, state.size[0], state.size[1])
			}),
			phys2D.createPolygonShape({
				vertices: phys2D.createRectangleVertices(0, (state.size[1] - thickness), state.size[0], state.size[1])
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
		element.style.width  = ((length + 2 * radius) * state.camera.zoom) + 'px';
		element.style.height = (radius * 2 * state.camera.zoom) + 'px';
		var transformString = 
			'translate(' +
				((x1 + normal[0] + normal[1]) * state.camera.zoom) + 'px,' +
				((y1 + normal[1] - normal[0]) * state.camera.zoom) + 'px)' +
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

	world.addRigidBody(createBelt( 0, 11,  7, 14, 0.5,  2));
	world.addRigidBody(createBelt( 7, 14, 12, 12, 0.5,  2));
	world.addRigidBody(createBelt(12, 18, 20, 15, 0.5, 12));
	world.addRigidBody(createBelt( 0, 22, 21, 22, 0.5,  2));
	world.addRigidBody(createBelt(20, 10, 10,  5, 0.5, -2));
	world.addRigidBody(createBelt(10,  5,  5,  5, 0.5, -2));
	world.addRigidBody(createBelt(21, 22, 30, 10, 0.5, 10));

	state.props.forEach(function(prop) {
		createPhysicsRepresentation(prop);
		createElementRepresentation(prop);
	});
}

var update = function() {
	world.step(1 / config.framerate);

	state.props.forEach(function(prop) {
		syncPhysicsRepresentation(prop);
		syncElementRepresentation(prop);
	});

	var currentTime = Date.now()
	var secondsElapsed = (currentTime - previousTime) / 1000;
	var fps = 1 / secondsElapsed;
	var renderSeconds = secondsElapsed * footageSeconds * config.framerate;
	fpsElement.innerHTML =
		('   ' + fps.toFixed(1)).substr(-5, 5) + 'fps | ' +
		footageSeconds + 's @ ' + config.framerate + 'fps &rarr; ' +
		(renderSeconds / 60 / 60).toFixed(2) + ' hours (' +
		(renderSeconds / 60).toFixed(1) + ' minutes)';
	previousTime = currentTime;

	requestAnimFrame(update);
}

init();
requestAnimFrame(update);

// Load prop definitions and add props once loaded
// -----------------------------------------------
var propDefs;
function addProp(propDef) {
	var bodies = [];
	propDef.bodies.forEach(function() {
		bodies.push({
			position: [10, 10],
			rotation: 0,
			velocity: [0, 0],
			angularVelocity: 0
		});
	});
	var prop = {
		name:   name,
		bodies: bodies
	};
	state.props.push(prop);
	createPhysicsRepresentation(prop);
	createElementRepresentation(prop);
}
var request = new XMLHttpRequest();
request.open("GET", "characters.json");
request.onload = function() {
	propDefs = JSON.parse(request.responseText);

	for (name in propDefs) {
		addProp(propDefs[name]);
	}
}
request.send();
