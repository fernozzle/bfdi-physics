var state = {
	gravity: [0, 20],
	size: [30, 22],
	props: [],
	camera: {
		position: [0, 0],
		zoom: 0.6
	}
};

var config = {
	imageScale: 50, // Size of images compared to defined shapes
	elementScale: 50, // Size to create/place elements
	maxTimestep: 0.5
};
var renderFramerate = 24;
var renderDuration  = 60; // in seconds

// Graphics setup ----------

var container = document.getElementById('container');
var stage     = document.getElementById('stage');
stage.style.width  = state.size[0] * config.elementScale + 'px';
stage.style.height = state.size[1] * config.elementScale + 'px';
updateStageTransform();
function setCamera(position, zoom) {
	state.camera.position = position;
	state.camera.zoom     = zoom;
	updateStageTransform();
}
function updateStageTransform() {
	var position = state.camera.position;
	var zoom     = state.camera.zoom;
	stage.style.transform =
		'scale(' +
			state.camera.zoom + ')' +
		'translate3d(' +
			(-position[0] * config.elementScale) + 'px,' +
			(-position[1] * config.elementScale) + 'px,0)';
}
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

var handReferenceBody = phys2D.createRigidBody({type: 'static'});
world.addRigidBody(handReferenceBody);
var handConstraint = null;

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

	function addBelt(start, end, radius, speed) {
		var prop = {
			name:   'belt',
			start:  start,
			end:    end,
			radius: radius,
			speed:  speed
		};
		state.props.push(prop);
	}
	addBelt([ 0, 11], [ 7, 14], 0.5,  2);
	addBelt([ 7, 14], [12, 12], 0.5,  2);
	addBelt([12, 18], [20, 15], 0.5, 12);
	addBelt([ 0, 22], [21, 22], 0.5,  2);
	addBelt([20, 10], [10,  5], 0.5, -2);
	addBelt([10,  5], [ 5,  5], 0.5, -2);
	addBelt([21, 22], [30, 10], 0.5, 10);

	state.props.forEach(function(prop) {
		PropManager.init(prop, stage, phys2D, world);
	});

	function getMousePosition(event, element) {
		var elementBounds = element.getBoundingClientRect();
		var elementX = elementBounds.left;
		var elementY = elementBounds.top;
		var mouseX = event.clientX;
		var mouseY = event.clientY;
		return [mouseX - elementX, mouseY - elementY];
	}
	function getWorldPosition(displayPosition) {
		var p = VMath.v2ScalarMul(
			displayPosition,
			1 / config.elementScale / state.camera.zoom
		);
		return VMath.v2Add(p, state.camera.position, p);
	}
	var mouseDown = function(event) {
		if (handConstraint) return;

		var point = getWorldPosition(getMousePosition(event, container));

		var bodies = [];
		world.bodyPointQuery(point, bodies);
		if (bodies[0]) {
			handConstraint = phys2D.createPointConstraint({
				bodyA: handReferenceBody,
				bodyB: bodies[0],
				anchorA: point,
				anchorB: bodies[0].transformWorldPointToLocal(point),
				stiff: false,
				maxForce: 1e6
			});
			world.addConstraint(handConstraint);
			console.log(bodies[0].userData.prop);
		}
		event.preventDefault();
		event.stopPropagation();
	}
	var mouseMove = function(event) {
		if (!handConstraint) return;

		var point = getWorldPosition(getMousePosition(event, container));

		handConstraint.setAnchorA(point);
	}
	var mouseUp = function(event) {
		if (handConstraint) {
			world.removeConstraint(handConstraint);
			handConstraint = null;
		}
	}
	container.addEventListener('mousedown', mouseDown, false);
	container.addEventListener('mousemove', mouseMove, false);
	container.addEventListener('mouseup',   mouseUp,   false);
	container.addEventListener('touchstart', function(event) {
		mouseDown(event.touches[0]);
	}, false);
	container.addEventListener('touchmove',  function(event) {
		mouseMove(event.touches[0]);
	}, false);
	container.addEventListener('touchend',   function(event) {
		mouseUp(event.touches[0]);
	}, false);
}

var update = function(delta, realDelta) {
	if (handConstraint) {
		var body = handConstraint.bodyB;
		body.setAngularVelocity(body.getAngularVelocity() * 0.9);
	}
	world.step(delta);

	state.props.forEach(function(prop) {
		PropManager.update(prop);
	});

	var fps = 1 / realDelta;
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
	};
	PropManager.init(prop, stage, phys2D, world);
	state.props.push(prop);
}
var request = new XMLHttpRequest();
request.open("GET", "characters.json");
request.onload = function() {
	PropManager.managers.simpleProp.propDefs = JSON.parse(request.responseText);

	for (name in PropManager.managers.simpleProp.propDefs) {
		addProp(PropManager.managers.simpleProp.propDefs[name]);
	}
}
request.send();
