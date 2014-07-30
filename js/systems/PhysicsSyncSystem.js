function PhysicsSyncSystem(physicsWorld) {
	var _nodes;
	var _physicsWorld = physicsWorld;

	// System Functions
	this.setup = function(game) {
		_nodes = game.getNodeList(PhysicsSyncNode);
	}

	this.update = function(time) {
		for(var i = 0; i < _nodes.length(); i++) {
			var node = _nodes.at(i);

			var transform = node.transform;
			var body = node.physicsBody.body;
			VMath.v2Copy(body.getPosition(), transform.position);
			transform.rotation = body.getRotation();
		}
	}

	this.detach = function(game) {
		_nodes = null;
	}
}
PhysicsSyncSystem.prototype = new ash.System();
