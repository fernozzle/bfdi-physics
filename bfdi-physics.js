var world;
	  
		 var   b2Vec2 = Box2D.Common.Math.b2Vec2
		 	,	b2BodyDef = Box2D.Dynamics.b2BodyDef
		 	,	b2Body = Box2D.Dynamics.b2Body
		 	,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
		 	,	b2Fixture = Box2D.Dynamics.b2Fixture
		 	,	b2World = Box2D.Dynamics.b2World
		 	,	b2MassData = Box2D.Collision.Shapes.b2MassData
		 	,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
		 	,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
		 	,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
			;
		 
		 world = new b2World(
			   new b2Vec2(0, 10)	//gravity
			,  true				 //allow sleep
		 );
		 
		 var fixDef = new b2FixtureDef;
		 fixDef.density = 1.0;
		 fixDef.friction = 0.5;
		 fixDef.restitution = 0.2;
		 
		 var bodyDef = new b2BodyDef;
		 
		 //create ground
		 var wallThick = 1;
		 var roomW = 20;
		 var roomH = 13;
		 
		 bodyDef.type = b2Body.b2_staticBody;
		 
		 // Left wall
		 bodyDef.position = new b2Vec2 (-wallThick / 2, roomH / 2);
		 fixDef.shape = new b2PolygonShape;
		 fixDef.shape.SetAsBox(wallThick / 2, roomH / 2 + wallThick);
		 world.CreateBody(bodyDef).CreateFixture(fixDef);
		 // Right wall
		 bodyDef.position = new b2Vec2 (roomW + wallThick / 2, roomH / 2);
		 fixDef.shape.SetAsBox(wallThick / 2, roomH / 2 + wallThick);
		 world.CreateBody(bodyDef).CreateFixture(fixDef);
		 // Bottom wall
		 bodyDef.position = new b2Vec2 (roomW / 2, roomH + wallThick / 2);
		 fixDef.shape.SetAsBox(roomW / 2 + wallThick, wallThick / 2);
		 world.CreateBody(bodyDef).CreateFixture(fixDef);
		 // Top wall
		 bodyDef.position = new b2Vec2 (roomW / 2, -wallThick / 2);
		 fixDef.shape.SetAsBox(roomW / 2 + wallThick, wallThick / 2);
		 world.CreateBody(bodyDef).CreateFixture(fixDef);
		 
		 function makeLeafy (p, world) {
			var x = [.00, .31, .50, .53];
			var y = [.88, .58, .27, .00];
			var len = x.length;
			var leafyVerts = []
			// Circle around
			for (var i = len-1; i >= 0; i--) leafyVerts.push (new b2Vec2 (x [i], y [i]));
			for (var i = 1; i <= len-1; i++) leafyVerts.push (new b2Vec2 (-x [i], y [i]));
			for (var i = len-2; i >= 0; i--) leafyVerts.push (new b2Vec2 (-x [i], -y [i]));
			for (var i = 1; i <= len-2; i++) leafyVerts.push (new b2Vec2 (x [i], -y [i]));
			var fixDef = new b2FixtureDef;
			fixDef.density = 0.1;
			fixDef.friction = 0.2;
			fixDef.restitution = 0.5;
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsArray (leafyVerts, leafyVerts.length);
			var bodyDef = new b2BodyDef;
			bodyDef.type = b2Body.b2_dynamicBody;
			bodyDef.position = p;
			world.CreateBody(bodyDef).CreateFixture(fixDef);
		 }
		 function makeRuby (p, world) {
			var x = [0.00, 1.01, 0.55];
			var y = [1.18, 0.33, 0.00];
			var len = x.length;
			var rubyVerts = [];
			rubyVerts.push (new b2Vec2 (x[0], y[0]));
			rubyVerts.push (new b2Vec2 (-x[1], y[1]));
			rubyVerts.push (new b2Vec2 (-x[2], y[2]));
			rubyVerts.push (new b2Vec2 (x[2], y[2]));
			rubyVerts.push (new b2Vec2 (x[1], y[1]));
			var fixDef = new b2FixtureDef;
			fixDef.density = 0.8;
			fixDef.friction = 0.05;
			fixDef.restitution = 0.5;
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsArray (rubyVerts, rubyVerts.length);
			var bodyDef = new b2BodyDef;
			bodyDef.type = b2Body.b2_dynamicBody;
			bodyDef.position = p;
			world.CreateBody(bodyDef).CreateFixture(fixDef);
		 }
		 function makeRocky (p, world) {
			var x = [-.75,-.70,-.37,-.01, .27, .51, .75, .25,-.26];
			var y = [ .28, .07,-.34,-.42,-.44,-.20, .28, .42, .42];
			var len = x.length;
			var rockyVerts = [];
			for (var i = 0; i < x.length; i++)
				rockyVerts.push (new b2Vec2 (x[i], y[i]));
			var fixDef = new b2FixtureDef;
			fixDef.density = 0.8;
			fixDef.friction = 0.7;
			fixDef.restitution = 0.5;
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsArray (rockyVerts, rockyVerts.length);
			var bodyDef = new b2BodyDef;
			bodyDef.type = b2Body.b2_dynamicBody;
			bodyDef.position = p;
			world.CreateBody(bodyDef).CreateFixture(fixDef);
		 }
		 function makeGelatin (p, world) {
			var x = [ .20, .66, .69, .59, .37, .09];
			var y = [ .66, .57, .36,-.17,-.60,-.66];
			var len = x.length;
			var gelatinVerts = [];
			for (var i = 0; i < x.length; i++)
				gelatinVerts.push (new b2Vec2 (-x[i], y[i]));
			for (var i = 0; i < x.length; i++)
				gelatinVerts.push (new b2Vec2 (x[x.length - 1 - i], y[y.length - 1 - i]));
			var fixDef = new b2FixtureDef;
			fixDef.density = 0.3;
			fixDef.friction = 0.05;
			fixDef.restitution = 0.2;
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsArray (gelatinVerts, gelatinVerts.length);
			var bodyDef = new b2BodyDef;
			bodyDef.type = b2Body.b2_dynamicBody;
			bodyDef.position = p;
			world.CreateBody(bodyDef).CreateFixture(fixDef);
		 }
		  function makeFries (p, world) {
			var x = [0.19,  0.50,  0.78,  0.49,  0.19];
			var y = [1.07,  1.03, -0.50, -0.86, -1.07];
			var len = x.length;
			var friesVerts = [];
			for (var i = 0; i < x.length; i++)
				friesVerts.push (new b2Vec2 (-x[i], y[i]));
			for (var i = 0; i < x.length; i++)
				friesVerts.push (new b2Vec2 (x[x.length - 1 - i], y[y.length - 1 - i]));
			var fixDef = new b2FixtureDef;
			fixDef.density = 0.3;
			fixDef.friction = 0.5;
			fixDef.restitution = 0.2;
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsArray (friesVerts, friesVerts.length);
			var bodyDef = new b2BodyDef;
			bodyDef.type = b2Body.b2_dynamicBody;
			bodyDef.position = p;
			world.CreateBody(bodyDef).CreateFixture(fixDef);
		 }
		 //create some objects
		 bodyDef.type = b2Body.b2_dynamicBody;
		 for(var i = 0; i < 20; ++i) {
			if(Math.random() > 0.5) {
			   fixDef.shape = new b2PolygonShape;
			   fixDef.shape.SetAsBox(
					 Math.random() + 0.1 //half width
				  ,  Math.random() + 0.1 //half height
			   );
			} else {
			   fixDef.shape = new b2CircleShape(
				  Math.random() + 0.1 //radius
			   );
			}
			bodyDef.position.x = Math.random() * 10;
			bodyDef.position.y = Math.random() * 10;
			world.CreateBody(bodyDef).CreateFixture(fixDef);
		 }
		 makeLeafy (new b2Vec2 (2, 2), world);
		 makeRuby (new b2Vec2 (4, 2), world);
		 makeRocky (new b2Vec2 (6, 2), world);
		 makeGelatin (new b2Vec2 (8, 2), world);
		 makeFries (new b2Vec2 (8, 2), world);
		 //setup debug draw
		 var debugDraw = new b2DebugDraw();
			debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
			debugDraw.SetDrawScale(30.0);
			debugDraw.SetFillAlpha(0.3);
			debugDraw.SetLineThickness(1.0);
			debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
			world.SetDebugDraw(debugDraw);
		 
		 window.setInterval(update, 1000 / 60);
	  
	  function update() {
		 world.Step(
			   1 / 60   //frame-rate
			,  10	   //velocity iterations
			,  10	   //position iterations
		 );
		 world.DrawDebugData();
		 world.ClearForces();
	  };