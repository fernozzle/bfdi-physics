var stageWidth  = 30;
var stageHeight = 22;

var imageScale    = 50; // Size of image dimensions compared to defined shapes
var graphicsScale = 40;  // Size to display bodies compared to defined shapes
var stageElement = document.getElementById('stage');
stageElement.style.width  = stageWidth  * graphicsScale + 'px';
stageElement.style.height = stageHeight * graphicsScale + 'px';
var degreesPerRadian = 57.2957795;

var phys2D = Physics2DDevice.create();
var framerate = 60;

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

var previousTime = Date.now();
var fpsElement = document.getElementById('fps');

function reset() {
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
		element.style.webkitTransform =
			'translate(' +
				((x1 + normal[0] + normal[1]) * graphicsScale) + 'px,' +
				((y1 + normal[1] - normal[0]) * graphicsScale) + 'px)' +
			'rotate(' +
				(degreesPerRadian * Math.atan2(y2 - y1, x2 - x1)) + 'deg)';
		stageElement.appendChild(element);

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

	for (var repeat = 0; repeat < 1; repeat++) {
		var i = 0;
		for (name in bodies) {
			var body = bodies[name];
			var shapes = body.shapes.map(function(shape) {
				return shape.clone();
			});
			var element = document.createElement('div');
			element.className = 'body';
			var image = document.createElement('img');
			image.style.left = (-body.userData.margin[0] * graphicsScale) + 'px';
			image.style.top  = (-body.userData.margin[1] * graphicsScale) + 'px';
			image.style.webkitTransform = 'scale(' + (graphicsScale / imageScale) + ')';
			image.src = 'images/' + name + '.png';
			element.appendChild(image);
			stageElement.appendChild(element);

			world.addRigidBody(phys2D.createRigidBody({
				shapes: shapes,
				position: [
					1 + (i      * 0.9),
					3 + (repeat * 1)
				],
				userData: {element: element}
			}));
			i++;
		}
	}
}

var update = function() {
	if (handConstraint) {
		handConstraint.setAnchorA(draw2D.viewportMap(mouseX, mouseY));

		var body = handConstraint.bodyB;
		body.setAngularVelocity(body.getAngularVelocity() * 0.9);
	}

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

	var position;
	world.rigidBodies.forEach(function(body) {
		if (body.userData) {
			position = body.getPosition();
			body.userData.element.style.webkitTransform =
				'translate3d(' +
					(position[0] * graphicsScale) + 'px,' +
					(position[1] * graphicsScale) + 'px,0)' +
				'rotate(' + (degreesPerRadian * body.getRotation()) + 'deg)';
		}
	});
	world.step(1 / framerate);

	var currentTime = Date.now()
	var secondsElapsed = (currentTime - previousTime) / 1000;
	var fps = 1 / secondsElapsed;
	var footageSeconds = 60;
	var renderSeconds = secondsElapsed * footageSeconds * framerate;
	fpsElement.innerHTML =
		('   ' + fps.toFixed(1)).substr(-5, 5) + 'fps | ' +
		footageSeconds + 's @ ' + framerate + 'fps &rarr; ' +
		(renderSeconds / 60 / 60).toFixed(2) + ' hours (' +
		(renderSeconds / 60).toFixed(1) + ' minutes)';
	previousTime = currentTime;

	requestAnimFrame(update);
}

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

var bodies;
var request = new XMLHttpRequest();
request.open("GET", "characters.json");
request.onload = function() {
	var bodyBuilder = BPT.BodyBuilder.create({phys2D: phys2D});
	bodies = bodyBuilder.buildBodies(request.responseText);

	reset();
	requestAnimFrame(update);
}
request.send();
