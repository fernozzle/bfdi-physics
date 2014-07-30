function EntityCreator(game) {
	var _game = game;

	this.destroyEntity = function(entity) {
		_game.removeEntity(entity);
	}
	this.createBody = function(physicsBody, element) {
		var body = new ash.Entity();

		body.add(new Transform(VMath.v2BuildZero(), 0));
		body.add(new DisplayElement(element));
		body.add(new PhysicsBody(physicsBody));

		_game.addEntity(body);
		return body;
	}
}
