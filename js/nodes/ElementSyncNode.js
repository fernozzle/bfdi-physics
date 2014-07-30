function ElementSyncNode() {
  this.transform = new Transform();
  this.displayElement = new DisplayElement();
}
ElementSyncNode.prototype = new ash.Node();
