BPT.Entity = function (object) {
	this.element = null;
	this.body = this.createBody(object);
}

BPT.Entity.prototype = {
	createBody: function (object) {
		var bodyDef = new Box2D.Dynamics.b2BodyDef();
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
		
		var body = world.CreateBody (bodyDef);
		
		var polygons = this.processPolygons (object.polygons, object.mirrorX, object.mirrorY);
		polygons.forEach (function (vertices) {
			var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
			fixtureDef.density = object.density;
			fixtureDef.friction = object.friction;
			fixtureDef.restitution = object.restitution;

			fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
			fixtureDef.shape.SetAsArray (vertices);
			
			body.CreateFixture (fixtureDef);
		});

		return body;
	},

	processPolygons: function (polygons, mirrorX, mirrorY) {
		var newPolygons = [];
		var topLeft = new Box2D.Common.Math.b2Vec2 (polygons[0][0][0], polygons[0][0][1]);

		polygons.forEach (function(vertices) {
			var newVertices = [];
			vertices.forEach (function (inputVertex) {
				var vertex = new Box2D.Common.Math.b2Vec2 (inputVertex[0], inputVertex[1]);
				newVertices.push (vertex);
				topLeft.MinV (vertex);
			});
			if (mirrorX) {
				vertices.reverse().forEach (function (inputVertex) {
					var vertex = new Box2D.Common.Math.b2Vec2 (-inputVertex[0], inputVertex[1]);
					if (vertex.x === 0) return;
					newVertices.push (vertex);
					topLeft.MinV (vertex);
				});
			}
			if (mirrorX && mirrorY) {
				vertices.reverse().forEach (function (inputVertex) {
					var vertex = new Box2D.Common.Math.b2Vec2 (-inputVertex[0], -inputVertex[1]);
					if (vertex.x === 0 || vertex.y === 0) return;
					newVertices.push (vertex);
					topLeft.MinV (vertex);
				});
			}
			if (mirrorY) {
				vertices.reverse().forEach (function (inputVertex) {
					var vertex = new Box2D.Common.Math.b2Vec2 (inputVertex[0], -inputVertex[1]);
					if (vertex.y === 0) return;
					newVertices.push (vertex);
					topLeft.MinV (vertex);
				});
			}
			newPolygons.push (newVertices);
		});

		newPolygons.forEach (function (vertices) {
			vertices.forEach (function (vertex) {
				vertex.Subtract (topLeft);
			});
		});

		return newPolygons;
	}
};
