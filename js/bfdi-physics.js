var width  = document.body.clientWidth;
var height = document.body.clientHeight;

var canvas  = document.getElementById ("canvas");
var context = canvas.getContext ("2d");
canvas.width  = width;
canvas.height = height;

var viewScale = 30;

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
var roomW = width  / viewScale;
var roomH = height / viewScale;

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

//setup debug draw
var debugDraw = new b2DebugDraw();
debugDraw.SetSprite (context);
debugDraw.SetDrawScale (viewScale);
debugDraw.SetFillAlpha (0.3);
debugDraw.SetLineThickness (1.0);
debugDraw.SetFlags (b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
world.SetDebugDraw (debugDraw);

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
var update = function() {
	world.Step (1/60, 10, 10); // framerate, velocity iterations, position iterations
	world.DrawDebugData();
	world.ClearForces();
	requestAnimFrame (update);
}
requestAnimFrame (update);

var request = new XMLHttpRequest();
request.open ("GET", "characters.json");
request.addEventListener ("load", function() {
	var responseText = request.responseText;
	responseText = responseText.replace(/^.*\/\/.*$/mg, "");
	var characters = JSON.parse (responseText);
	console.log (characters.length);
	characters.forEach (function (character) {
		var entity = new BPT.Entity (
			character,
			[
				Math.random() * roomW * 0.9,
				Math.random() * roomH * 0.9
			]
		);
		for (var i = 0; i < 0; i++) {
			new BPT.Entity (
				character,
				[
					Math.random() * roomW * 0.9,
					Math.random() * roomH * 0.9
				]
			);
		}
	});
}, false);
request.send();

