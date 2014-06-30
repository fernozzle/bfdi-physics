var world;
	  
var
	b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Body = Box2D.Dynamics.b2Body,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2Fixture = Box2D.Dynamics.b2Fixture,
	b2World = Box2D.Dynamics.b2World,
	b2MassData = Box2D.Collision.Shapes.b2MassData,
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
	b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
 
world = new b2World (new b2Vec2(0, 50), true);
 
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

//create some objects
/*
bodyDef.type = b2Body.b2_dynamicBody;
for(var i = 0; i < 20; i++) {
	if(Math.random() > 0.5) {
		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox (Math.random() + 0.1, Math.random() + 0.1);
	} else {
		fixDef.shape = new b2CircleShape (Math.random() + 0.1);
	}
	bodyDef.position.x = Math.random() * 10;
	bodyDef.position.y = Math.random() * 10;
	world.CreateBody (bodyDef).CreateFixture (fixDef);
}
*/
//setup debug draw
var debugDraw = new b2DebugDraw();
debugDraw.SetSprite (document.getElementById ("canvas").getContext ("2d"));
debugDraw.SetDrawScale (30.0);
debugDraw.SetFillAlpha (0.3);
debugDraw.SetLineThickness (1.0);
debugDraw.SetFlags (b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
world.SetDebugDraw (debugDraw);

window.setInterval (function() {
	world.Step (1/60, 10, 10); // framerate, velocity iterations, position iterations
	world.DrawDebugData();
	world.ClearForces();
}, 1000 / 60);

var request = new XMLHttpRequest();
request.open ("GET", "characters.json");
request.addEventListener ("load", function() {
	var characters = JSON.parse (request.responseText);
	characters.forEach (function (character) {
		var entity = new BPT.Entity (character);
	});
}, false);
request.send();

