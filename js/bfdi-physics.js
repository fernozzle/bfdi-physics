var canvas = document.getElementById("canvas");
canvas.width  = document.body.clientWidth;
canvas.height = document.body.clientHeight;

TurbulenzEngine = WebGLTurbulenzEngine.create({
	canvas: canvas
});

TurbulenzEngine.onload = function onloadFn() {
	//==========================================================================
	// Turbulenz Initialization
	//==========================================================================
	var graphicsDevice = TurbulenzEngine.createGraphicsDevice({});
	var mathDevice = TurbulenzEngine.createMathDevice({});
	var requestHandler = RequestHandler.create({});

	//==========================================================================
	// Physics2D/Draw2D
	//==========================================================================
	var phys2D = Physics2DDevice.create();

	// size of physics stage.
	var stageWidth = 30;
	var stageHeight = 22;

	var draw2D = Draw2D.create({
		graphicsDevice: graphicsDevice
	});
	var debug = Physics2DDebugDraw.create({
		graphicsDevice: graphicsDevice
	});

	// Configure draw2D viewport to the physics stage.
	// As well as the physics2D debug-draw viewport.
	draw2D.configure({
		viewportRectangle: [0, 0, stageWidth, stageHeight],
		scaleMode: 'scale'
	});
	debug.setPhysics2DViewport([0, 0, stageWidth, stageHeight]);

	var world = phys2D.createWorld({
		gravity: [0, 20]
	});

	var conveyorBeltMaterial = phys2D.createMaterial({
		elasticity: 0,
		staticFriction: 10,
		dynamicFriction: 8,
		rollingFriction: 0.1
	});

	var bodies;
	TurbulenzEngine.request("characters.json", function(jsonData) {
		var bodyBuilder = BPT.BodyBuilder.create({phys2D: phys2D});
		bodies = bodyBuilder.buildBodies(jsonData);
	});

	var handReferenceBody = phys2D.createRigidBody({
		type: 'static'
	});
	world.addRigidBody(handReferenceBody);
	var handConstraint = null;

	var animationState = 0;
	var lift;
	var pusher;

	function reset() {
		// Remove all bodies and constraints from world.
		world.clear();
		handConstraint = null;

		// Create a static border body around the stage to stop objects leaving the viewport.
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
			var normal = mathDevice.v2Build(y2 - y1, x1 - x2);
			mathDevice.v2ScalarMul(normal, radius / mathDevice.v2Length(normal), normal);

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
			var body = phys2D.createRigidBody({
				type: 'static',
				surfaceVelocity: [speed, 0],
				shapes: shapes
			});

			return body;
		};

		var belt;
		belt = createBelt(0, 11, 7, 14, 0.5, 2);
		world.addRigidBody(belt);

		belt = createBelt(7, 14, 14, 11, 0.5, 2);
		world.addRigidBody(belt);

		belt = createBelt(12, 19, 20.5, 17, 0.5, 2);
		world.addRigidBody(belt);

		belt = createBelt(0, 22, 21, 22, 0.5, 2);
		world.addRigidBody(belt);

		belt = createBelt(20.5, 10.5, 10, 5, 0.5, -2);
		world.addRigidBody(belt);

		belt = createBelt(10, 5, 5, 5, 0.5, -2);
		world.addRigidBody(belt);

		// Create lift and pusher bodies.
		lift = phys2D.createRigidBody({
			shapes: [
				phys2D.createPolygonShape({
					vertices: phys2D.createBoxVertices(9, 0.01)
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

		var i = 0;
		for (name in bodies) {
			var shapes = bodies[name].shapes.map(function(shape) {
				return shape.clone();
			});
			var body = phys2D.createRigidBody({
				shapes: shapes,
				position: [i * 0.9, 1]
			});
			world.addRigidBody(body);
			i++;
		}
	}

	//==========================================================================
	// Mouse/Keyboard controls
	//==========================================================================
	var inputDevice = TurbulenzEngine.createInputDevice({});
	var keyCodes = inputDevice.keyCodes;
	var mouseCodes = inputDevice.mouseCodes;

	var mouseX = 0;
	var mouseY = 0;
	var onMouseOver = function mouseOverFn(x, y) {
		mouseX = x;
		mouseY = y;
	};
	inputDevice.addEventListener('mouseover', onMouseOver);

	var onKeyUp = function onKeyUpFn(keynum) {
		if (keynum === keyCodes.R) {
			reset();
		}
	};
	inputDevice.addEventListener('keyup', onKeyUp);

	var onMouseDown = function onMouseDownFn(code, x, y) {
		mouseX = x;
		mouseY = y;

		if (handConstraint) {
			return;
		}

		var point = draw2D.viewportMap(x, y);
		var body;
		if (code === mouseCodes.BUTTON_0) {
			var bodies = [];
			var numBodies = world.bodyPointQuery(point, bodies);
			var i;
			for (i = 0; i < numBodies; i += 1) {
				body = bodies[i];
				if (body.isDynamic()) {
					handConstraint = phys2D.createPointConstraint({
						bodyA: handReferenceBody,
						bodyB: body,
						anchorA: point,
						anchorB: body.transformWorldPointToLocal(point),
						stiff: false,
						maxForce: 1e5
					});
					world.addConstraint(handConstraint);
					break;
				}
			}
		} else if (code === mouseCodes.BUTTON_1) {
			var index = Math.floor(Math.random() * shapeFactory.length);
			body = phys2D.createRigidBody({
				shapes: [shapeFactory[index].clone()],
				position: point
			});
			world.addRigidBody(body);
		}
	};
	inputDevice.addEventListener('mousedown', onMouseDown);

	var onMouseLeaveUp = function onMouseLeaveUpFn() {
		if (handConstraint) {
			world.removeConstraint(handConstraint);
			handConstraint = null;
		}
	};
	inputDevice.addEventListener('mouseleave', onMouseLeaveUp);
	inputDevice.addEventListener('mouseup', onMouseLeaveUp);

	//==========================================================================
	// Main loop.
	//==========================================================================
	var realTime = 0;
	var prevTime = TurbulenzEngine.time;

	function mainLoop() {
		if (!graphicsDevice.beginFrame()) {
			return;
		}

		inputDevice.update();
		graphicsDevice.clear([0.3, 0.3, 0.3, 1.0]);

		var body;
		if (handConstraint) {
			body = handConstraint.bodyB;
			handConstraint.setAnchorA(draw2D.viewportMap(mouseX, mouseY));
			body.setAngularVelocity(body.getAngularVelocity() * 0.9);
		}

		var curTime = TurbulenzEngine.time;
		var timeDelta = (curTime - prevTime);

		if (timeDelta > (1 / 20)) {
			timeDelta = (1 / 20);
		}
		realTime += timeDelta;
		prevTime = curTime;

		while (world.simulatedTime < realTime) {
			if (animationState === 0) {
				// Start of animatino, set velocity of lift to move up to the target
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

			world.step(1 / 60);
		}

		// physics2D debug drawing.
		debug.setScreenViewport(draw2D.getScreenSpaceViewport());
		debug.showRigidBodies = true;

		debug.begin();
		debug.drawWorld(world);
		debug.end();

		graphicsDevice.endFrame();
	}

	var intervalID;
	function loadingLoop() {
		if(!bodies) return;
		reset();
		TurbulenzEngine.clearInterval(intervalID);
		intervalID = TurbulenzEngine.setInterval(mainLoop, 1000 / 60);
	}
	intervalID = TurbulenzEngine.setInterval(loadingLoop, 10);

	TurbulenzEngine.onunload = function destroyScene() {
		if (intervalID) {
			TurbulenzEngine.clearInterval(intervalID);
		}
	};
};

window.onload = TurbulenzEngine.onload;
