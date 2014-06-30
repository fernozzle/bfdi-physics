BPT.Entity = function (object) {
	this.element = null;
	this.body = this.createBody(object);
}

BPT.Entity.prototype = {
	createBody: function (object) {
		var bodyDef = new Box2D.Dynamics.b2BodyDef();
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
		
		var body = world.CreateBody (bodyDef);
		
		var shapes = object.shapes;
		shapes.forEach (function (shape) {
			body.CreateFixture (this.createFixtureDef (shape, object));
		}, this);
		/*
		var polygons = this.mirrorPolygons (object.polygons, object.mirrorX, object.mirrorY);
		polygons.forEach (function (vertices) {
			var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
			fixtureDef.density = object.density;
			fixtureDef.friction = object.friction;
			fixtureDef.restitution = object.restitution;

			fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
			fixtureDef.shape.SetAsArray (vertices);
			
			body.CreateFixture (fixtureDef);
		});
		*/

		return body;
	},

	createFixtureDef: function (shape, object) {
		var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
		fixtureDef.density = object.density;
		fixtureDef.friction = object.friction;
		fixtureDef.restitution = object.restitution;
		if (shape.radius !== undefined) { // Circle
			fixtureDef.shape = new Box2D.Collision.Shapes.b2CircleShape (shape.radius);
			fixtureDef.shape.m_p.x = shape.center[0];
			fixtureDef.shape.m_p.y = shape.center[1];
		} else { // Polygon
			fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
			fixtureDef.shape.SetAsArray (this.mirrorPolygon (shape, object.mirrorX, object.mirrorY));
		}
		return fixtureDef;
	},

	mirrorPolygon: function (vertices, mirrorX, mirrorY) {
		if (!vertices) return [];
		
		//var topLeft = new Box2D.Common.Math.b2Vec2 (polygons[0][0][0], polygons[0][0][1]);

		var newVertices = [];
		if (true) {
			vertices.forEach (function (inputVertex) {
				var vertex = new Box2D.Common.Math.b2Vec2 (inputVertex[0], inputVertex[1]);
				newVertices.push (vertex);
				//topLeft.MinV (vertex);
			});
		}
		if (mirrorX) {
			vertices.reverse().forEach (function (inputVertex) {
				var vertex = new Box2D.Common.Math.b2Vec2 (-inputVertex[0], inputVertex[1]);
				if (vertex.x === 0) return;
				newVertices.push (vertex);
				//topLeft.MinV (vertex);
			});
		}
		if (mirrorX && mirrorY) {
			vertices.reverse().forEach (function (inputVertex) {
				var vertex = new Box2D.Common.Math.b2Vec2 (-inputVertex[0], -inputVertex[1]);
				if (vertex.x === 0 || vertex.y === 0) return;
				newVertices.push (vertex);
				//topLeft.MinV (vertex);
			});
		}
		if (mirrorY) {
			vertices.reverse().forEach (function (inputVertex) {
				var vertex = new Box2D.Common.Math.b2Vec2 (inputVertex[0], -inputVertex[1]);
				if (vertex.y === 0) return;
				newVertices.push (vertex);
				//topLeft.MinV (vertex);
			});
		}

		/*
		newPolygons.forEach (function (vertices) {
			vertices.forEach (function (vertex) {
				vertex.Subtract (topLeft);
			});
		});
		*/

		return newVertices;
	}
};
