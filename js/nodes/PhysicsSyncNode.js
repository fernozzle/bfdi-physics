function PhysicsSyncNode() {
  this.transform   = new Transform();
  this.physicsBody = new PhysicsBody();
}
PhysicsSyncNode.prototype = new ash.Node();
