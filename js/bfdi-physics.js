var state = {
	gravity: [0, 20],
	size: [30, 22],
	props: [],
	camera: {zoom: 30}
};

var config = {
	imageScale: 50 // Size of images compared to defined shapes
};
var renderFramerate = 24;
var renderDuration  = 60; // in seconds

// Graphics setup ----------

var stage = document.getElementById('stage');
stage.style.width  = state.size[0] * state.camera.zoom + 'px';
stage.style.height = state.size[1] * state.camera.zoom + 'px';
var degreesPerRadian = 57.2957795;

var animator = new Animator();

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
		prop.type.init(prop, stage, phys2D);
	});
}

var update = function(delta) {
	world.step(delta);

	state.props.forEach(function(prop) {
		prop.type.update(prop);
	});

	var fps = 1 / delta;
	var renderSeconds = delta * renderDuration * renderFramerate;
	fpsElement.innerHTML =
		('   ' + fps.toFixed(1)).substr(-5, 5) + 'fps | ' +
		renderDuration + 's @ ' + renderFramerate + 'fps &rarr; ' +
		(renderSeconds / 60 / 60).toFixed(2) + ' hours (' +
		(renderSeconds / 60).toFixed(1) + ' minutes)';
}

init();
animator.start(update);

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
		bodies: bodies,
		type:   SimpleProp
	};
	prop.type.init(prop, stage, phys2D);
	state.props.push(prop);
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
