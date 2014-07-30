function PhysicsSyncSystem() {
	var _nodes;

	// System Functions
	this.setup = function(game) {
		_nodes = game.getNodeList(PhysicsSyncNode);
	}

	this.update = function(time) {
		for(var i = 0; i < _nodes.length(); i++) {
			var node = _nodes.at(i);

			var transform = node.transform;
			var body = node.physicsBody;
			VMath.v2Copy(body.getPosition(), transform.position);
			transform.rotation = body.getRotation();
		}
	}

	this.detach = function(game) {
		_nodes = null;
	}
}
PhysicsSyncSystem.prototype = new ash.System();
