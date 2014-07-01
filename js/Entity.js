BPT.Entity = function (object, position) {
	this.element = null;
	this.body = BPT.BodyBuilder.createBody(object, position);
}
